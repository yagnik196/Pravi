from fastapi import FastAPI, HTTPException, Query, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import datetime

from database import (
    get_mongo_db,
    init_mongodb,
    check_mongo_health,
    seed_database,
    log_audit_event,
    create_notification,
    MONGO_DATABASE
)

app = FastAPI(
    title="PRAVI — Gujarat R&B Infrastructure Monitoring API (P1)",
    description="Unified Project-Centric Infrastructure Monitoring & Contract Lifecycle Platform for Gujarat Roads & Buildings Department.",
    version="1.1.0",
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper to convert MongoDB document for JSON responses
def serialize_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_mongo_id"] = str(doc.pop("_id"))
    return doc


def serialize_mongo_list(docs) -> List[Dict[str, Any]]:
    return [serialize_mongo_doc(d) for d in docs]


def calculate_aging_days(created_at_str: Optional[str]) -> int:
    """Calculate issue age in days relative to current time."""
    if not created_at_str:
        return 0
    try:
        # Handles ISO format like 2026-09-25T09:30:00Z or date 2026-09-25
        clean_str = created_at_str.replace("Z", "+00:00")
        if "T" in clean_str:
            dt = datetime.datetime.fromisoformat(clean_str)
        else:
            dt = datetime.datetime.strptime(clean_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
        now = datetime.datetime.now(datetime.timezone.utc)
        delta = now - dt
        return max(0, delta.days)
    except Exception:
        return 0


def get_aging_bucket(days: int) -> str:
    if days <= 2:
        return "0–2 days"
    elif days <= 7:
        return "3–7 days"
    elif days <= 30:
        return "8–30 days"
    else:
        return "30+ days"


def check_district_scope(requested_district: Optional[str], actor_role: Optional[str], actor_district: Optional[str]):
    """Enforce access control: District-1 (Ahmedabad) and District-2 (Surat) cannot mutate each other's operational data."""
    if not actor_role:
        return  # Prototype flexibility if header not provided
    if actor_role in ["District-1", "District-2"]:
        expected = "Ahmedabad" if actor_role == "District-1" else "Surat"
        if requested_district and requested_district.lower() != expected.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: {actor_role} ({expected}) is not authorized to modify resources belonging to '{requested_district}' District."
            )


# ============================================================================
# Pydantic Request Models
# ============================================================================

class ProjectCreate(BaseModel):
    id: str = Field(..., example="RNB-2026-007")
    name: str = Field(..., example="Mehsana Highway Bypass Overbridge")
    category: str = Field(..., example="Road")  # Road, Bridge, Building
    work_type: str = Field(default="Development", example="Development")  # Development, Maintenance
    state: str = Field(default="Gujarat")
    region: str = Field(..., example="Ahmedabad Region")
    district: str = Field(..., example="Ahmedabad")
    location: str = Field(..., example="SH-41 Mehsana-Radhanpur Bypass")
    responsible_org: str = Field(..., example="Mehsana R&B Division")
    responsible_employee: str = Field(..., example="Er. B. K. Joshi (Executive Engineer)")
    contractor: str = Field(..., example="Apex Concessions Pvt Ltd")
    estimated_cost_cr: float = Field(..., example=65.0)
    current_stage: str = Field(default="Proposal")
    lifecycle_status: str = Field(default="PLANNED")
    start_date: str = Field(..., example="2026-10-01")
    expected_completion: str = Field(..., example="2027-12-31")
    description: str = Field(..., example="Construction of 4-lane bypass with grade separator over railway line")
    priority: str = Field(default="Medium")
    status: str = Field(default="Active")
    progress_percent: int = Field(default=0)


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress_percent: Optional[int] = None
    expected_completion: Optional[str] = None
    contractor: Optional[str] = None
    current_stage: Optional[str] = None
    lifecycle_status: Optional[str] = None
    health_status: Optional[str] = None
    quality_score: Optional[int] = None
    public_condition: Optional[str] = None


class CommentCreate(BaseModel):
    author: str = Field(..., example="Er. H. Dave")
    role: str = Field(..., example="State")  # State, District-1, District-2, Evaluator
    message: str = Field(..., example="Please ensure safety audit is scheduled before deck slab casting.")


class ChangeRequestCreate(BaseModel):
    requested_by: str = Field(..., example="State Authority (Chief Engineer, R&B Gandhinagar)")
    message: str = Field(..., example="Please update expected completion date and submit revised milestone resource plan.")


class ChangeRequestResponse(BaseModel):
    district_response: str = Field(..., example="Revised milestone schedule submitted; contractor deployed extra crane.")


class MonitoringRuleCreate(BaseModel):
    metric: str = Field(..., example="Road Quality")
    parameter: Optional[str] = None
    operator: str = Field(..., example="<")  # <, <=, >, >=, =, equals, less_than, greater_than
    threshold_value: Any = Field(..., example=60)
    severity: str = Field(default="Critical", example="Critical")
    issue_title: str = Field(..., example="Road Quality fell below acceptable threshold")
    description: Optional[str] = None


class EvaluationSubmit(BaseModel):
    evaluator_name: Optional[str] = None
    overall_quality_score: Optional[int] = Field(default=None, example=48)
    metrics: Dict[str, Any] = Field(..., example={"Road Quality": 48, "Quality": "Poor", "Milestone Completion": "Not Completed"})
    observations: str = Field(..., example="Pier 15 deck slab casting remains incomplete. Severe honeycomb voids detected.")
    recommendation: Optional[str] = Field(default="", example="Issue stop-work notice on deck slab until pressure grouting is verified.")
    evidence_files: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class TimelineAdvance(BaseModel):
    target_stage: str = Field(..., example="Acknowledged")
    actor: str = Field(..., example="Er. R. K. Patel (EE Ahmedabad)")
    role: Optional[str] = Field(default="District-1")
    notes: Optional[str] = Field(default="", example="District Executive Engineer formally acknowledged critical defect notice.")
    failed_verification: Optional[bool] = Field(default=False)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class MaintenanceCreate(BaseModel):
    issue_id: str = Field(..., example="ISSUE-1024")
    infrastructure_id: str = Field(..., example="RNB-2026-001")
    assigned_party: str = Field(..., example="ABC Infrastructure Ltd. Maintenance Wing")
    priority: str = Field(default="High", example="High")
    scheduled_date: str = Field(..., example="2026-09-30")
    description: str = Field(..., example="Micro-silica pressure grouting and hydraulic deck leveling")
    cost_estimate_cr: Optional[float] = Field(default=0.5, example=0.5)
    evidence: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class MaintenanceUpdate(BaseModel):
    status: Optional[str] = None  # SCHEDULED, IN_PROGRESS, COMPLETED, VERIFIED
    completion_date: Optional[str] = None
    cost_estimate_cr: Optional[float] = None
    description: Optional[str] = None
    evidence: Optional[List[Dict[str, Any]]] = None


class MaintenanceVerify(BaseModel):
    verifier_name: str = Field(..., example="Er. Pravin Varma (SQM)")
    passed: bool = Field(..., example=True)
    verification_notes: str = Field(..., example="Compressive strength tests exceed 42 MPa. Ultrasonic pulse test confirms void elimination.")


class ProposalSubmit(BaseModel):
    tender_id: str = Field(..., example="TND-2026-104")
    company_name: str = Field(..., example="Gujarat Megastructure Builders LLP")
    contact_email: str = Field(..., example="bids@megastructure-guj.com")
    contact_phone: Optional[str] = Field(default="", example="+91 98250 11223")
    proposed_amount_cr: float = Field(..., example=204.5)
    proposal_summary: str = Field(..., example="Turnkey proposal for 64km 4-lane rigid concrete pavement using dual-slipform pavers.")
    documents: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class EvidenceUpload(BaseModel):
    file_name: str = Field(..., example="inspection_photo_01.jpg")
    file_url: str = Field(..., example="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop")
    file_type: str = Field(default="image/jpeg", example="image/jpeg")
    uploaded_by: str = Field(..., example="Er. Pravin Varma (SQM)")
    entity_type: str = Field(..., example="project")  # project, issue, maintenance, evaluation
    entity_id: str = Field(..., example="RNB-2026-001")
    caption: Optional[str] = Field(default="", example="Field core sample crack inspection")


# ============================================================================
# Startup
# ============================================================================

@app.on_event("startup")
def startup_event():
    print("[Startup] Initializing PRAVI P1 MongoDB...")
    res = init_mongodb()
    if res["success"]:
        print(f"[MongoDB] {res['message']}")
    else:
        print(f"[MongoDB Warning] {res['error']}")


# ============================================================================
# System & Health Endpoints
# ============================================================================

@app.get("/", tags=["System"])
def root():
    return {
        "service": "PRAVI Infrastructure Monitoring & Contract Lifecycle API",
        "authority": "Gujarat Roads & Buildings Department",
        "phase": "P1 Operational Infrastructure Management Platform",
        "database": "MongoDB Atlas",
        "status": "operational",
        "features": [
            "P1.1 Scoped Access Control (State, District-1, District-2, Evaluator, Vendor, Citizen)",
            "P1.2 Full Infrastructure Lifecycle (PLANNED -> RETIRED)",
            "P1.3 Multi-Metric Monitoring & Generic Configurable Rules (<, >, <=, >=, =)",
            "P1.4 Issue Lifecycle & Traceability (DETECTED -> CLOSED)",
            "P1.5 Dedicated Maintenance Workflow & Evidence",
            "P1.6 Evaluator Field Inspection with Verification & Evidence",
            "P1.7 First-Class Operational Timeline Events",
            "P1.8 State Aggregate & District Comparison Analytics + Issue Aging",
            "P1.9 Tender Bidding & Vendor Proposals",
            "P1.10 Sanitized Citizen Public Transparency Portal",
            "P1.11 In-App Notifications & Alerts",
            "P1.12 System Audit Trail"
        ]
    }


@app.get("/api/health", tags=["System"])
def health_check():
    health = check_mongo_health()
    return {
        "status": "healthy" if health["status"] == "connected" else "degraded",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "database": health
    }


@app.post("/api/seed", tags=["System"])
def seed_data(force: bool = Query(default=False)):
    """Seed or reseed MongoDB with Gujarat R&B P1 dataset."""
    res = seed_database(force=force)
    if not res["success"]:
        raise HTTPException(status_code=500, detail=res.get("error"))
    return res


# ============================================================================
# Organizational Hierarchy & Analytics Endpoints (P1.8)
# ============================================================================

@app.get("/api/hierarchy", tags=["Hierarchy"])
def get_hierarchy():
    """Returns Gujarat State -> Regions -> Districts organizational hierarchy.
    IMPORTANT: Region is a geographic grouping container only; authority belongs to State & Districts.
    """
    db = get_mongo_db()
    regions = list(db.regions_districts.find({}, {"_id": 0}))
    return {
        "state": "Gujarat",
        "note": "Region is a geographic grouping container only. Operational authority belongs to State and respective District administrations.",
        "regions": regions
    }


@app.get("/api/stats", tags=["Dashboard Stats"])
def get_stats(district: Optional[str] = None, region: Optional[str] = None):
    """Aggregate statistics for State & District dashboards with P1 analytics:
    - Infrastructure health (Healthy, Warning, Critical)
    - Issue aging breakdown (0-2d, 3-7d, 8-30d, 30+d)
    - Maintenance status load (Scheduled, Active, Verification, Completed)
    - District comparison table (Assets, Open Issues, Critical, Maintenance, Avg Quality)
    """
    db = get_mongo_db()
    
    # 1. Projects Query
    proj_query = {}
    if district:
        proj_query["district"] = district
    elif region:
        proj_query["region"] = region
    projects = list(db.projects.find(proj_query, {"_id": 0}))
    total_projects = len(projects)

    # Health distribution
    healthy_count = sum(1 for p in projects if p.get("health_status") == "Healthy" or (p.get("quality_score", 0) >= 80 and p.get("status") == "Active"))
    warning_count = sum(1 for p in projects if p.get("health_status") == "Warning" or (60 <= p.get("quality_score", 70) < 80))
    critical_count = sum(1 for p in projects if p.get("health_status") == "Critical" or p.get("quality_score", 100) < 60 or p.get("status") == "Delayed")

    # Categories
    roads_count = sum(1 for p in projects if p.get("category") == "Road")
    bridges_count = sum(1 for p in projects if p.get("category") == "Bridge")
    buildings_count = sum(1 for p in projects if p.get("category") == "Building")

    total_cost_cr = sum(p.get("estimated_cost_cr", 0.0) for p in projects)
    avg_quality = (sum(p.get("quality_score", 70) for p in projects) / total_projects) if total_projects > 0 else 0

    # 2. Issues Query & Issue Aging
    iss_query = {}
    if district:
        iss_query["district"] = district
    elif region:
        iss_query["region"] = region
    issues = list(db.issues.find(iss_query, {"_id": 0}))

    open_issues = [i for i in issues if i.get("status") not in ["RESOLVED", "CLOSED"]]
    critical_issues = [i for i in open_issues if i.get("severity") == "Critical"]
    resolved_issues = [i for i in issues if i.get("status") in ["RESOLVED", "CLOSED"]]

    # Issue Aging breakdown
    aging_buckets = {
        "0–2 days": 0,
        "3–7 days": 0,
        "8–30 days": 0,
        "30+ days": 0
    }
    for iss in open_issues:
        days = iss.get("aging_days")
        if days is None:
            days = calculate_aging_days(iss.get("created_at") or iss.get("detected_date"))
        bucket = get_aging_bucket(days)
        aging_buckets[bucket] += 1

    # 3. Maintenance Query
    maint_query = {}
    if district:
        maint_query["district"] = district
    maint_list = list(db.maintenance.find(maint_query, {"_id": 0}))
    maint_scheduled = sum(1 for m in maint_list if m.get("status") == "SCHEDULED")
    maint_active = sum(1 for m in maint_list if m.get("status") == "IN_PROGRESS")
    maint_verification = sum(1 for m in maint_list if m.get("status") == "COMPLETED" or m.get("verification_requested"))
    maint_verified = sum(1 for m in maint_list if m.get("status") == "VERIFIED")

    # 4. Evaluations Query
    eval_query = {}
    if district:
        eval_query["district"] = district
    evals = list(db.evaluations.find(eval_query, {"_id": 0}))

    # 5. Tenders Query
    tenders = list(db.tenders.find({}, {"_id": 0}))
    proposals = list(db.proposals.find({}, {"_id": 0}))

    # 6. District Comparison Table (State level transparency)
    all_projects = list(db.projects.find({}, {"_id": 0}))
    all_issues = list(db.issues.find({}, {"_id": 0}))
    all_maint = list(db.maintenance.find({}, {"_id": 0}))
    all_evals = list(db.evaluations.find({}, {"_id": 0}))

    districts_list = ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Gandhinagar", "Bharuch"]
    district_comparison = []

    for d in districts_list:
        d_projs = [p for p in all_projects if p.get("district") == d]
        d_issues = [i for i in all_issues if i.get("district") == d and i.get("status") not in ["RESOLVED", "CLOSED"]]
        d_critical = [i for i in d_issues if i.get("severity") == "Critical"]
        d_maint = [m for m in all_maint if m.get("district") == d and m.get("status") in ["SCHEDULED", "IN_PROGRESS"]]
        d_evals = [e for e in all_evals if e.get("district") == d and e.get("status") == "submitted"]
        d_avg_q = round((sum(p.get("quality_score", 70) for p in d_projs) / len(d_projs)), 1) if d_projs else 0

        district_comparison.append({
            "district": d,
            "total_assets": len(d_projs),
            "open_issues": len(d_issues),
            "critical_issues": len(d_critical),
            "active_maintenance": len(d_maint),
            "completed_evaluations": len(d_evals),
            "avg_quality_score": d_avg_q
        })

    return {
        "scope": {
            "state": "Gujarat",
            "region": region or "All Regions",
            "district": district or "All Districts"
        },
        "infrastructure": {
            "total": total_projects,
            "healthy": healthy_count,
            "warning": warning_count,
            "critical": critical_count,
            "by_type": {
                "roads": roads_count,
                "bridges": bridges_count,
                "buildings": buildings_count
            },
            "total_cost_cr": round(total_cost_cr, 2),
            "average_quality_score": round(avg_quality, 1)
        },
        "issues": {
            "total": len(issues),
            "open": len(open_issues),
            "critical": len(critical_issues),
            "resolved": len(resolved_issues),
            "aging": aging_buckets
        },
        "maintenance": {
            "total": len(maint_list),
            "scheduled": maint_scheduled,
            "active": maint_active,
            "pending_verification": maint_verification,
            "completed": maint_verified
        },
        "evaluations": {
            "total": len(evals),
            "pending": sum(1 for e in evals if e.get("status") == "assigned"),
            "completed": sum(1 for e in evals if e.get("status") == "submitted")
        },
        "tenders": {
            "total": len(tenders),
            "open": sum(1 for t in tenders if t.get("status") in ["OPEN", "Open for Bidding"]),
            "awarded": sum(1 for t in tenders if t.get("status") in ["AWARDED", "Awarded"]),
            "proposals_submitted": len(proposals)
        },
        "district_comparison": district_comparison
    }


# ============================================================================
# Infrastructure & Projects Endpoints (P1.2 & Single Source of Truth)
# ============================================================================

@app.get("/api/infrastructure", tags=["Infrastructure"])
@app.get("/api/projects", tags=["Projects"])
def list_infrastructure(
    district: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    work_type: Optional[str] = None,
    lifecycle_status: Optional[str] = None,
    health_status: Optional[str] = None,
    search: Optional[str] = None
):
    """List infrastructure assets with comprehensive filtering."""
    db = get_mongo_db()
    query = {}
    if district:
        query["district"] = district
    if region:
        query["region"] = region
    if category:
        query["category"] = category
    if work_type:
        query["work_type"] = work_type
    if lifecycle_status:
        query["lifecycle_status"] = lifecycle_status
    if health_status:
        query["health_status"] = health_status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"id": {"$regex": search, "$options": "i"}},
            {"contractor": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]

    projects = list(db.projects.find(query, {"_id": 0}).sort("id", 1))
    return {
        "success": True,
        "count": len(projects),
        "data": projects
    }


@app.get("/api/infrastructure/{project_id}", tags=["Infrastructure"])
@app.get("/api/projects/{project_id}", tags=["Projects"])
def get_infrastructure_detail(project_id: str):
    """Single Source of Truth: retrieves infrastructure asset with live issues, maintenance, evaluations, evidence, and rules."""
    db = get_mongo_db()
    project = db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail=f"Infrastructure record with ID '{project_id}' not found")

    # Fetch linked operational data
    related_issues = list(db.issues.find({"project_id": project_id}, {"_id": 0}).sort("id", -1))
    related_maintenance = list(db.maintenance.find({"infrastructure_id": project_id}, {"_id": 0}).sort("id", -1))
    related_evaluations = list(db.evaluations.find({"project_id": project_id}, {"_id": 0}).sort("due_date", -1))
    related_tenders = list(db.tenders.find({"project_id": project_id}, {"_id": 0}))

    # Calculate issue aging dynamically
    for iss in related_issues:
        iss["aging_days"] = calculate_aging_days(iss.get("created_at") or iss.get("detected_date"))
        iss["aging_bucket"] = get_aging_bucket(iss["aging_days"])

    project["live_issues"] = related_issues
    project["live_maintenance"] = related_maintenance
    project["live_evaluations"] = related_evaluations
    project["live_tenders"] = related_tenders

    return {
        "success": True,
        "data": project
    }


@app.post("/api/projects", status_code=status.HTTP_201_CREATED, tags=["Projects"])
def create_project(payload: ProjectCreate, x_role: Optional[str] = Header(None)):
    """Create a new infrastructure project (District ownership with scope check)."""
    check_district_scope(payload.district, x_role, payload.district)
    db = get_mongo_db()
    existing = db.projects.find_one({"id": payload.id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Project ID '{payload.id}' already exists")

    doc = payload.model_dump()
    doc["asset_id"] = payload.id
    doc["health_status"] = "Healthy"
    doc["quality_score"] = 90
    doc["public_visible"] = True
    doc["public_condition"] = "Proposed - In Administrative Review"
    doc["metrics_current"] = {"Road Quality": 90, "Progress Rate": 0}
    doc["lifecycle_stages"] = [
        {"stage": "Proposal", "status": "completed", "completed_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"), "note": "Created by District Division"},
        {"stage": "State Approval", "status": "in_progress", "completed_at": None, "note": "Submitted for State Review"},
        {"stage": "Tender Proposal", "status": "upcoming", "completed_at": None},
        {"stage": "Tender Approval", "status": "upcoming", "completed_at": None},
        {"stage": "Contract / SLA", "status": "upcoming", "completed_at": None},
        {"stage": "Development", "status": "upcoming", "completed_at": None},
        {"stage": "Maintenance", "status": "upcoming", "completed_at": None}
    ]
    doc["milestones"] = []
    doc["evaluation_config"] = [
        {"parameter": "Road Quality", "unit": "Score (0-100)", "monitoring_type": "Quality", "target_description": "Minimum acceptable riding score >= 60"},
        {"parameter": "Physical Progress", "unit": "%", "monitoring_type": "Progress"},
        {"parameter": "Quality", "unit": "Grade", "options": ["Excellent", "Good", "Satisfactory", "Poor"], "monitoring_type": "Quality"}
    ]
    doc["monitoring_rules"] = [
        {"id": f"RULE-RQ-{payload.id}", "metric": "Road Quality", "parameter": "Road Quality", "operator": "<", "threshold_value": 60, "action": "create_issue", "issue_title": "Road Quality fell below minimum threshold (60)", "severity": "Critical"},
        {"id": f"RULE-Q-{payload.id}", "metric": "Quality", "parameter": "Quality", "operator": "=", "threshold_value": "Poor", "action": "create_issue", "issue_title": "Field quality audit reported Poor", "severity": "Critical"}
    ]
    doc["evidence"] = []
    doc["change_requests"] = []
    doc["comments"] = []

    db.projects.insert_one(doc)

    log_audit_event(
        actor=payload.responsible_employee,
        role=x_role or "District",
        action="CREATE_INFRASTRUCTURE",
        entity_type="project",
        entity_id=payload.id,
        details=f"Created new infrastructure record '{payload.name}' in {payload.district} District."
    )

    created = db.projects.find_one({"id": payload.id}, {"_id": 0})
    return {"success": True, "message": "Infrastructure created successfully", "data": created}


@app.patch("/api/projects/{project_id}", tags=["Projects"])
def update_project(project_id: str, payload: ProjectUpdate, x_role: Optional[str] = Header(None)):
    """Update infrastructure asset information (District scope protected)."""
    db = get_mongo_db()
    existing = db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")

    check_district_scope(existing.get("district"), x_role, existing.get("district"))

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    db.projects.update_one({"id": project_id}, {"$set": update_data})

    log_audit_event(
        actor=f"{x_role or 'Authority'}",
        role=x_role or "District",
        action="UPDATE_INFRASTRUCTURE",
        entity_type="project",
        entity_id=project_id,
        details=f"Updated infrastructure attributes: {list(update_data.keys())}",
        old_value=None,
        new_value=str(update_data)
    )

    updated = db.projects.find_one({"id": project_id}, {"_id": 0})
    return {"success": True, "message": "Project updated successfully", "data": updated}


@app.post("/api/projects/{project_id}/comments", tags=["Projects"])
def add_project_comment(project_id: str, payload: CommentCreate):
    """Add a discussion comment to a project."""
    db = get_mongo_db()
    comment = {
        "id": f"c-{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}",
        "author": payload.author,
        "role": payload.role,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "message": payload.message
    }
    result = db.projects.update_one({"id": project_id}, {"$push": {"comments": comment}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"success": True, "message": "Comment added", "data": comment}


@app.post("/api/projects/{project_id}/change-requests", tags=["Projects"])
def create_change_request(project_id: str, payload: ChangeRequestCreate):
    """State Authority creates a change request for a district-owned project."""
    db = get_mongo_db()
    cr = {
        "id": f"CR-{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}",
        "requested_by": payload.requested_by,
        "requested_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "message": payload.message,
        "status": "Pending",
        "district_response": None
    }
    result = db.projects.update_one({"id": project_id}, {"$push": {"change_requests": cr}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    project = db.projects.find_one({"id": project_id})
    if project:
        create_notification(
            recipient_role=f"District-{1 if project.get('district') == 'Ahmedabad' else 2}",
            district=project.get("district"),
            notif_type="CHANGE_REQUEST",
            title=f"State Change Request on {project.get('name')}",
            message=payload.message,
            entity_type="project",
            entity_id=project_id
        )

    return {"success": True, "message": "State change request lodged", "data": cr}


@app.post("/api/projects/{project_id}/change-requests/{cr_id}/respond", tags=["Projects"])
def respond_change_request(project_id: str, cr_id: str, payload: ChangeRequestResponse):
    """District responds to a State Authority change request."""
    db = get_mongo_db()
    result = db.projects.update_one(
        {"id": project_id, "change_requests.id": cr_id},
        {"$set": {
            "change_requests.$.status": "Addressed",
            "change_requests.$.district_response": payload.district_response,
            "change_requests.$.responded_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project or Change Request not found")

    return {"success": True, "message": "District responded to change request"}


# ============================================================================
# Advanced Monitoring Rules & Evaluator Inspections (P1.3 & P1.6)
# ============================================================================

@app.post("/api/projects/{project_id}/monitoring-rules", tags=["Monitoring"])
def add_monitoring_rule(project_id: str, payload: MonitoringRuleCreate):
    """District or State configures an automated monitoring rule."""
    db = get_mongo_db()
    rule_id = f"RULE-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 100000}"
    rule_doc = {
        "id": rule_id,
        "metric": payload.metric,
        "parameter": payload.parameter or payload.metric,
        "operator": payload.operator,
        "threshold_value": payload.threshold_value,
        "severity": payload.severity,
        "issue_title": payload.issue_title,
        "description": payload.description or f"Triggered when {payload.metric} {payload.operator} {payload.threshold_value}"
    }

    result = db.projects.update_one(
        {"id": project_id},
        {"$push": {"monitoring_rules": rule_doc}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"success": True, "message": "Monitoring rule added successfully", "data": rule_doc}


@app.get("/api/evaluations", tags=["Evaluations"])
def list_evaluations(
    evaluator_id: Optional[str] = None,
    district: Optional[str] = None,
    project_id: Optional[str] = None,
    status: Optional[str] = None
):
    """List evaluations filterable by evaluator, district, project, or status."""
    db = get_mongo_db()
    query = {}
    if evaluator_id:
        query["evaluator_id"] = evaluator_id
    if district:
        query["district"] = district
    if project_id:
        query["project_id"] = project_id
    if status:
        query["status"] = status

    evals = list(db.evaluations.find(query, {"_id": 0}).sort("due_date", 1))
    return {"success": True, "count": len(evals), "data": evals}


@app.get("/api/evaluations/{eval_id}", tags=["Evaluations"])
def get_evaluation(eval_id: str):
    """Get single evaluation record with configured parameters and rules from the parent project."""
    db = get_mongo_db()
    evaluation = db.evaluations.find_one({"id": eval_id}, {"_id": 0})
    if not evaluation:
        raise HTTPException(status_code=404, detail=f"Evaluation '{eval_id}' not found")

    project = db.projects.find_one({"id": evaluation["project_id"]}, {"_id": 0, "evaluation_config": 1, "monitoring_rules": 1, "milestones": 1, "quality_score": 1})
    evaluation["project_evaluation_config"] = project.get("evaluation_config", []) if project else []
    evaluation["project_monitoring_rules"] = project.get("monitoring_rules", []) if project else []

    return {"success": True, "data": evaluation}


@app.post("/api/evaluations/{eval_id}/submit", tags=["Evaluations"])
def submit_evaluation(eval_id: str, payload: EvaluationSubmit):
    """Evaluator submits ground-truth metrics, observations, and evidence.
    Core P1 Automation:
    1. Evaluator submits ground-truth data. Record becomes immutable.
    2. Automated Rule Engine checks multi-metric rules (<, >, <=, >=, =).
    3. If any threshold breached -> Issue automatically created with exact root cause!
    4. Operational timeline event emitted.
    5. District notified and audit log written.
    """
    db = get_mongo_db()
    evaluation = db.evaluations.find_one({"id": eval_id})
    if not evaluation:
        raise HTTPException(status_code=404, detail=f"Evaluation '{eval_id}' not found")

    if evaluation.get("is_immutable") or evaluation.get("status") == "submitted":
        raise HTTPException(
            status_code=400,
            detail="Evaluation has already been submitted and is immutable. Historical records cannot be modified."
        )

    project_id = evaluation["project_id"]
    project = db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Parent infrastructure project not found")

    monitoring_rules = project.get("monitoring_rules", [])
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    now_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    triggered_rules = []
    created_issues = []

    # ========================================================================
    # Multi-Metric Generic Rule Engine (<, >, <=, >=, =, equals, less_than)
    # ========================================================================
    for rule in monitoring_rules:
        metric_name = rule.get("metric") or rule.get("parameter")
        op = str(rule.get("operator", "=")).strip()
        threshold = rule.get("threshold_value")
        observed = payload.metrics.get(metric_name)

        # Fallback check on parameter alias
        if observed is None and rule.get("parameter"):
            observed = payload.metrics.get(rule.get("parameter"))

        rule_matched = False
        if observed is not None:
            # String equality check
            if op in ["=", "==", "equals"]:
                if str(observed).lower().strip() == str(threshold).lower().strip():
                    rule_matched = True
            # Numeric checks
            else:
                try:
                    obs_num = float(observed)
                    thr_num = float(threshold)
                    if op in ["<", "less_than"] and obs_num < thr_num:
                        rule_matched = True
                    elif op in ["<=", "less_than_equals"] and obs_num <= thr_num:
                        rule_matched = True
                    elif op in [">", "greater_than"] and obs_num > thr_num:
                        rule_matched = True
                    elif op in [">=", "greater_than_equals"] and obs_num >= thr_num:
                        rule_matched = True
                except (ValueError, TypeError):
                    pass

        if rule_matched:
            triggered_rules.append(rule.get("id"))
            issue_id = f"ISSUE-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 100000}"
            issue_title = rule.get("issue_title", f"Rule exception detected on {metric_name}")
            severity = rule.get("severity", "Critical")

            # Explanation of why the system generated the issue (Section 9)
            detection_reason = f"{metric_name} observed value ({observed}) violated rule condition: threshold {op} {threshold}. Immediate engineering review required."

            issue_doc = {
                "id": issue_id,
                "project_id": project_id,
                "project_name": project.get("name"),
                "district": project.get("district"),
                "region": project.get("region"),
                "evaluation_id": eval_id,
                "title": issue_title,
                "detected_metric": metric_name,
                "detected_value": str(observed),
                "threshold_value": str(threshold),
                "operator": op,
                "rule_id": rule.get("id"),
                "detection_reason": detection_reason,
                "parameter": metric_name,
                "observed_value": f"{observed} (Threshold: {threshold})",
                "severity": severity,
                "detected_date": now_date,
                "created_at": now_iso,
                "aging_days": 0,
                "responsible_org": project.get("responsible_org"),
                "responsible_employee": project.get("responsible_employee"),
                "assigned_to": project.get("responsible_employee"),
                "status": "OPEN",
                "maintenance_id": None,
                "resolution_notes": "",
                "evidence": payload.evidence_files or [],
                "operational_timeline": [
                    {
                        "event_id": f"EVT-{issue_id}-1",
                        "stage": "Detected",
                        "timestamp": now_iso,
                        "actor": "System (Automated Rule Engine)",
                        "status": "completed",
                        "details": f"Field evaluation {eval_id} recorded {metric_name} = '{observed}', breaching configured rule condition ({op} {threshold}). Issue automatically created.",
                        "metadata": {
                            "metric": metric_name,
                            "observed_value": observed,
                            "threshold": threshold,
                            "operator": op,
                            "rule_id": rule.get("id")
                        }
                    },
                    {
                        "event_id": f"EVT-{issue_id}-2",
                        "stage": "Acknowledged",
                        "timestamp": None,
                        "actor": project.get("responsible_employee"),
                        "status": "upcoming",
                        "details": f"District authority review and formal acknowledgment.",
                        "metadata": {}
                    },
                    {
                        "event_id": f"EVT-{issue_id}-3",
                        "stage": "Assigned",
                        "timestamp": None,
                        "actor": project.get("responsible_org"),
                        "status": "upcoming",
                        "details": f"Assign maintenance repair agency / contractor.",
                        "metadata": {}
                    },
                    {
                        "event_id": f"EVT-{issue_id}-4",
                        "stage": "In Progress",
                        "timestamp": None,
                        "actor": project.get("contractor"),
                        "status": "upcoming",
                        "details": "Corrective field engineering and repair activity.",
                        "metadata": {}
                    },
                    {
                        "event_id": f"EVT-{issue_id}-5",
                        "stage": "Pending Verification",
                        "timestamp": None,
                        "actor": "Independent Quality Monitor",
                        "status": "upcoming",
                        "details": "Evaluator on-site verification of completed maintenance.",
                        "metadata": {}
                    },
                    {
                        "event_id": f"EVT-{issue_id}-6",
                        "stage": "Resolved",
                        "timestamp": None,
                        "actor": "District Executive Engineer",
                        "status": "upcoming",
                        "details": "Verification confirmed and issue resolved.",
                        "metadata": {}
                    },
                    {
                        "event_id": f"EVT-{issue_id}-7",
                        "stage": "Closed",
                        "timestamp": None,
                        "actor": "District Authority",
                        "status": "upcoming",
                        "details": "Administrative closure and archiving.",
                        "metadata": {}
                    }
                ]
            }
            db.issues.insert_one(issue_doc)
            created_issues.append(serialize_mongo_doc(issue_doc))

            # Trigger in-app notification to District
            district_role = "District-1" if project.get("district") == "Ahmedabad" else "District-2"
            create_notification(
                recipient_role=district_role,
                district=project.get("district"),
                notif_type="CRITICAL_ISSUE",
                title=f"Exception Detected on {project.get('name')}",
                message=detection_reason,
                entity_type="issue",
                entity_id=issue_id
            )

    # Calculate overall quality score if provided or derived
    submitted_q = payload.overall_quality_score
    if submitted_q is None and "Road Quality" in payload.metrics:
        try:
            submitted_q = int(payload.metrics["Road Quality"])
        except Exception:
            pass

    # Mark evaluation submitted & immutable
    generated_issue_id = created_issues[0]["id"] if created_issues else None
    update_eval = {
        "status": "submitted",
        "submitted_at": now_iso,
        "is_immutable": True,
        "metrics": payload.metrics,
        "observations": payload.observations,
        "recommendation": payload.recommendation or "",
        "evidence_files": payload.evidence_files or [],
        "rules_triggered": triggered_rules,
        "generated_issue_id": generated_issue_id
    }
    if submitted_q is not None:
        update_eval["quality_score"] = submitted_q
    if payload.evaluator_name:
        update_eval["evaluator_name"] = payload.evaluator_name

    db.evaluations.update_one({"id": eval_id}, {"$set": update_eval})

    # Update project current metrics & quality score
    proj_updates = {"metrics_current": payload.metrics}
    if submitted_q is not None:
        proj_updates["quality_score"] = submitted_q
        if submitted_q < 60:
            proj_updates["health_status"] = "Critical"
            proj_updates["status"] = "Delayed"
        elif submitted_q < 80:
            proj_updates["health_status"] = "Warning"
        else:
            proj_updates["health_status"] = "Healthy"
    elif created_issues:
        proj_updates["health_status"] = "Critical"
        proj_updates["status"] = "Delayed"

    # Add evidence files to project evidence gallery
    if payload.evidence_files:
        db.projects.update_one(
            {"id": project_id},
            {"$push": {"evidence": {"$each": payload.evidence_files}}}
        )

    db.projects.update_one({"id": project_id}, {"$set": proj_updates})

    # Log audit event
    log_audit_event(
        actor=payload.evaluator_name or evaluation.get("evaluator_name") or "Field Evaluator",
        role="Evaluator",
        action="SUBMIT_EVALUATION",
        entity_type="evaluation",
        entity_id=eval_id,
        details=f"Submitted field audit with {len(payload.metrics)} metrics. Generated {len(created_issues)} issues."
    )

    updated_eval = db.evaluations.find_one({"id": eval_id}, {"_id": 0})
    return {
        "success": True,
        "message": "Evaluation submitted successfully and saved as immutable record.",
        "data": updated_eval,
        "rules_evaluated": len(monitoring_rules),
        "rules_triggered": triggered_rules,
        "issues_created": created_issues
    }


# ============================================================================
# Issue Management & Operational Timeline (P1.4, P1.7)
# ============================================================================

@app.get("/api/issues", tags=["Issues"])
def list_issues(
    district: Optional[str] = None,
    region: Optional[str] = None,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    """List issues filterable by district, project, status, severity, and search."""
    db = get_mongo_db()
    query = {}
    if district:
        query["district"] = district
    if region:
        query["region"] = region
    if project_id:
        query["project_id"] = project_id
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"id": {"$regex": search, "$options": "i"}},
            {"parameter": {"$regex": search, "$options": "i"}},
            {"project_name": {"$regex": search, "$options": "i"}}
        ]

    issues = list(db.issues.find(query, {"_id": 0}).sort("id", -1))
    for iss in issues:
        iss["aging_days"] = calculate_aging_days(iss.get("created_at") or iss.get("detected_date"))
        iss["aging_bucket"] = get_aging_bucket(iss["aging_days"])

    return {"success": True, "count": len(issues), "data": issues}


@app.get("/api/issues/{issue_id}", tags=["Issues"])
def get_issue(issue_id: str):
    """Retrieve full issue detail with detection reason, threshold violation, linked maintenance, and operational timeline."""
    db = get_mongo_db()
    issue = db.issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue '{issue_id}' not found")

    issue["aging_days"] = calculate_aging_days(issue.get("created_at") or issue.get("detected_date"))
    issue["aging_bucket"] = get_aging_bucket(issue["aging_days"])

    # Link maintenance record if exists
    if issue.get("maintenance_id"):
        maint = db.maintenance.find_one({"id": issue["maintenance_id"]}, {"_id": 0})
        issue["linked_maintenance"] = maint

    return {"success": True, "data": issue}


@app.post("/api/issues/{issue_id}/timeline-advance", tags=["Issues"])
@app.post("/api/issues/{issue_id}/transition", tags=["Issues"])
def advance_operational_timeline(
    issue_id: str,
    payload: TimelineAdvance,
    x_role: Optional[str] = Header(None)
):
    """Advance the issue resolution through its Operational Timeline:
    Detected -> Acknowledged -> Assigned -> In Progress -> Pending Verification -> Resolved -> Closed
    Enforces district authorization and emits first-class operational timeline events.
    """
    db = get_mongo_db()
    issue = db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue '{issue_id}' not found")

    # Authorization Check
    check_district_scope(issue.get("district"), x_role or payload.role, issue.get("district"))

    timeline = issue.get("operational_timeline", [])
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    target_stage = payload.target_stage

    # Handle Verification Failure scenario (reverts to In Progress)
    if payload.failed_verification:
        for step in timeline:
            if step["stage"] in ["Verification", "Pending Verification"]:
                step["status"] = "failed"
                step["details"] = f"Verification failed by {payload.actor}: {payload.notes}. Reverted to In Progress."
                step["timestamp"] = now_iso
            elif step["stage"] in ["In Progress", "Action Initiated"]:
                step["status"] = "in_progress"
                step["timestamp"] = now_iso
                step["details"] = f"Remediation activity re-opened following verification failure."
            elif step["stage"] in ["Resolved", "Closed"]:
                step["status"] = "upcoming"
                step["timestamp"] = None

        new_status = "IN_PROGRESS"
        notes = f"Verification rejected: {payload.notes}"

        # If maintenance linked, also revert maintenance status
        if issue.get("maintenance_id"):
            db.maintenance.update_one(
                {"id": issue["maintenance_id"]},
                {"$set": {"status": "IN_PROGRESS", "verification_requested": False, "verification_notes": notes}}
            )
    else:
        # Sequential progression
        found_target = False
        for step in timeline:
            if step["stage"].lower() == target_stage.lower():
                step["status"] = "completed" if target_stage.lower() in ["resolved", "closed"] else "in_progress"
                step["timestamp"] = now_iso
                step["actor"] = payload.actor
                if payload.notes:
                    step["details"] = payload.notes
                found_target = True
            elif not found_target:
                step["status"] = "completed"
            else:
                step["status"] = "upcoming"

        stage_to_status = {
            "detected": "OPEN",
            "acknowledged": "ACKNOWLEDGED",
            "assigned": "ASSIGNED",
            "in progress": "IN_PROGRESS",
            "action initiated": "IN_PROGRESS",
            "pending verification": "PENDING_VERIFICATION",
            "resolution submitted": "PENDING_VERIFICATION",
            "resolved": "RESOLVED",
            "closed": "CLOSED"
        }
        new_status = stage_to_status.get(target_stage.lower(), target_stage.upper())
        notes = payload.notes or issue.get("resolution_notes", "")

    # Persist update
    db.issues.update_one(
        {"id": issue_id},
        {"$set": {
            "status": new_status,
            "operational_timeline": timeline,
            "resolution_notes": notes,
            "last_updated": now_iso
        }}
    )

    # Log audit event
    log_audit_event(
        actor=payload.actor,
        role=x_role or payload.role or "District",
        action="ISSUE_TRANSITION",
        entity_type="issue",
        entity_id=issue_id,
        details=f"Transitioned issue status to '{new_status}'. Notes: {notes}",
        old_value=issue.get("status"),
        new_value=new_status
    )

    # If issue resolved, check if parent project should be restored to Healthy / Active
    if new_status in ["RESOLVED", "CLOSED"]:
        project_id = issue["project_id"]
        unresolved = db.issues.count_documents({
            "project_id": project_id,
            "status": {"$nin": ["RESOLVED", "CLOSED"]}
        })
        if unresolved == 0:
            db.projects.update_one(
                {"id": project_id},
                {"$set": {"status": "Active", "health_status": "Healthy"}}
            )

    updated_issue = db.issues.find_one({"id": issue_id}, {"_id": 0})
    return {
        "success": True,
        "message": f"Operational timeline transitioned to '{target_stage}'.",
        "data": updated_issue
    }


# ============================================================================
# Maintenance Workflow Endpoints (P1.5)
# ============================================================================

@app.get("/api/maintenance", tags=["Maintenance"])
def list_maintenance(
    district: Optional[str] = None,
    infrastructure_id: Optional[str] = None,
    issue_id: Optional[str] = None,
    status: Optional[str] = None
):
    """List maintenance workflows filterable by district, infrastructure, issue, status."""
    db = get_mongo_db()
    query = {}
    if district:
        query["district"] = district
    if infrastructure_id:
        query["infrastructure_id"] = infrastructure_id
    if issue_id:
        query["issue_id"] = issue_id
    if status:
        query["status"] = status

    maintenance = list(db.maintenance.find(query, {"_id": 0}).sort("id", -1))
    return {"success": True, "count": len(maintenance), "data": maintenance}


@app.get("/api/maintenance/{maint_id}", tags=["Maintenance"])
def get_maintenance(maint_id: str):
    """Retrieve maintenance workflow detail."""
    db = get_mongo_db()
    maint = db.maintenance.find_one({"id": maint_id}, {"_id": 0})
    if not maint:
        raise HTTPException(status_code=404, detail=f"Maintenance '{maint_id}' not found")
    return {"success": True, "data": maint}


@app.post("/api/maintenance", status_code=status.HTTP_201_CREATED, tags=["Maintenance"])
def create_maintenance(payload: MaintenanceCreate, x_role: Optional[str] = Header(None)):
    """Create a structured maintenance activity connected to an issue (District operational responsibility)."""
    db = get_mongo_db()
    project = db.projects.find_one({"id": payload.infrastructure_id})
    if not project:
        raise HTTPException(status_code=404, detail="Parent infrastructure not found")

    check_district_scope(project.get("district"), x_role, project.get("district"))

    maint_id = f"MAINT-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 100000}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    doc = {
        "id": maint_id,
        "issue_id": payload.issue_id,
        "infrastructure_id": payload.infrastructure_id,
        "infrastructure_name": project.get("name"),
        "district": project.get("district"),
        "region": project.get("region"),
        "assigned_party": payload.assigned_party,
        "priority": payload.priority,
        "scheduled_date": payload.scheduled_date,
        "start_date": payload.scheduled_date,
        "completion_date": None,
        "description": payload.description,
        "cost_estimate_cr": payload.cost_estimate_cr,
        "status": "IN_PROGRESS",
        "verification_requested": False,
        "verifier_name": "State Quality Monitor (SQM)",
        "verification_notes": None,
        "evidence": payload.evidence or [],
        "created_at": now_iso
    }
    db.maintenance.insert_one(doc)

    # Link to issue and advance issue timeline to ASSIGNED / IN_PROGRESS
    db.issues.update_one(
        {"id": payload.issue_id},
        {"$set": {
            "maintenance_id": maint_id,
            "status": "IN_PROGRESS",
            "assigned_to": payload.assigned_party
        }}
    )

    log_audit_event(
        actor=f"{x_role or 'District Authority'}",
        role=x_role or "District",
        action="CREATE_MAINTENANCE",
        entity_type="maintenance",
        entity_id=maint_id,
        details=f"Created maintenance {maint_id} for issue {payload.issue_id} assigned to {payload.assigned_party}."
    )

    created = db.maintenance.find_one({"id": maint_id}, {"_id": 0})
    return {"success": True, "message": "Maintenance workflow initiated", "data": created}


@app.post("/api/maintenance/{maint_id}/complete", tags=["Maintenance"])
def complete_maintenance(maint_id: str, x_role: Optional[str] = Header(None)):
    """Contractor or District marks maintenance completed. Automatically triggers Evaluator Verification request!"""
    db = get_mongo_db()
    maint = db.maintenance.find_one({"id": maint_id})
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    now_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    db.maintenance.update_one(
        {"id": maint_id},
        {"$set": {
            "status": "COMPLETED",
            "completion_date": now_date,
            "verification_requested": True,
            "completed_at": now_iso
        }}
    )

    # Advance linked issue to PENDING_VERIFICATION
    issue_id = maint.get("issue_id")
    if issue_id:
        issue = db.issues.find_one({"id": issue_id})
        if issue:
            timeline = issue.get("operational_timeline", [])
            for step in timeline:
                if step["stage"] in ["In Progress", "Action Initiated"]:
                    step["status"] = "completed"
                elif step["stage"] in ["Pending Verification", "Verification"]:
                    step["status"] = "in_progress"
                    step["timestamp"] = now_iso
                    step["details"] = f"Maintenance {maint_id} marked completed by {maint.get('assigned_party')}. Awaiting Evaluator verification."

            db.issues.update_one(
                {"id": issue_id},
                {"$set": {
                    "status": "PENDING_VERIFICATION",
                    "operational_timeline": timeline,
                    "last_updated": now_iso
                }}
            )

    # Dispatch notification to Evaluators
    create_notification(
        recipient_role="Evaluator",
        district=maint.get("district"),
        notif_type="VERIFICATION_REQUIRED",
        title=f"Verification Required: {maint.get('infrastructure_name')}",
        message=f"Maintenance {maint_id} marked completed. Field verification and material audit required.",
        entity_type="maintenance",
        entity_id=maint_id
    )

    return {"success": True, "message": "Maintenance marked completed. Verification dispatched to Evaluator."}


@app.post("/api/maintenance/{maint_id}/verify", tags=["Maintenance"])
def verify_maintenance(maint_id: str, payload: MaintenanceVerify):
    """Evaluator verifies repair quality on site. If verified -> Issue resolves! If rejected -> rolls back to In Progress."""
    db = get_mongo_db()
    maint = db.maintenance.find_one({"id": maint_id})
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    issue_id = maint.get("issue_id")

    if payload.passed:
        # Verification passed -> Resolve
        db.maintenance.update_one(
            {"id": maint_id},
            {"$set": {
                "status": "VERIFIED",
                "verification_notes": payload.verification_notes,
                "verifier_name": payload.verifier_name,
                "verified_at": now_iso
            }}
        )

        if issue_id:
            issue = db.issues.find_one({"id": issue_id})
            if issue:
                timeline = issue.get("operational_timeline", [])
                for step in timeline:
                    if step["stage"] in ["Pending Verification", "Verification"]:
                        step["status"] = "completed"
                        step["actor"] = payload.verifier_name
                        step["timestamp"] = now_iso
                        step["details"] = f"Verification PASSED: {payload.verification_notes}"
                    elif step["stage"] == "Resolved":
                        step["status"] = "completed"
                        step["timestamp"] = now_iso
                        step["details"] = "Issue successfully rectified and verified."

                db.issues.update_one(
                    {"id": issue_id},
                    {"$set": {
                        "status": "RESOLVED",
                        "operational_timeline": timeline,
                        "resolution_notes": f"Verified by {payload.verifier_name}: {payload.verification_notes}",
                        "last_updated": now_iso
                    }}
                )

                # Check if all issues for this project are resolved
                project_id = issue.get("project_id")
                if project_id:
                    unresolved = db.issues.count_documents({
                        "project_id": project_id,
                        "status": {"$nin": ["RESOLVED", "CLOSED"]}
                    })
                    if unresolved == 0:
                        db.projects.update_one(
                            {"id": project_id},
                            {"$set": {
                                "health_status": "Healthy",
                                "status": "Active",
                                "quality_score": 85,
                                "public_condition": "Operational - Scheduled Maintenance Completed & Verified"
                            }}
                        )

        log_audit_event(
            actor=payload.verifier_name,
            role="Evaluator",
            action="VERIFY_MAINTENANCE_PASSED",
            entity_type="maintenance",
            entity_id=maint_id,
            details=f"Verification passed: {payload.verification_notes}"
        )

        return {"success": True, "message": "Verification passed! Issue resolved and asset restored to Healthy."}
    else:
        # Verification failed -> Revert
        db.maintenance.update_one(
            {"id": maint_id},
            {"$set": {
                "status": "IN_PROGRESS",
                "verification_requested": False,
                "verification_notes": f"Verification REJECTED: {payload.verification_notes}"
            }}
        )

        if issue_id:
            issue = db.issues.find_one({"id": issue_id})
            if issue:
                timeline = issue.get("operational_timeline", [])
                for step in timeline:
                    if step["stage"] in ["Pending Verification", "Verification"]:
                        step["status"] = "failed"
                        step["actor"] = payload.verifier_name
                        step["details"] = f"Verification FAILED: {payload.verification_notes}. Reverted to In Progress."
                    elif step["stage"] in ["In Progress", "Action Initiated"]:
                        step["status"] = "in_progress"
                        step["details"] = "Corrective rework initiated following audit rejection."

                db.issues.update_one(
                    {"id": issue_id},
                    {"$set": {
                        "status": "IN_PROGRESS",
                        "operational_timeline": timeline,
                        "resolution_notes": f"Rework required. Rejected by {payload.verifier_name}: {payload.verification_notes}",
                        "last_updated": now_iso
                    }}
                )

        log_audit_event(
            actor=payload.verifier_name,
            role="Evaluator",
            action="VERIFY_MAINTENANCE_FAILED",
            entity_type="maintenance",
            entity_id=maint_id,
            details=f"Verification failed: {payload.verification_notes}"
        )

        return {"success": True, "message": "Verification failed. Maintenance reverted to In Progress for contractor rework."}


# ============================================================================
# Tenders & Third-Party Company Proposals (P1.9)
# ============================================================================

@app.get("/api/tenders", tags=["Tenders"])
def list_tenders(
    district: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None
):
    """List tenders for Third-Party Vendors & internal visibility."""
    db = get_mongo_db()
    query = {}
    if district:
        query["district"] = district
    if category:
        query["category"] = category
    if status:
        query["status"] = status

    tenders = list(db.tenders.find(query, {"_id": 0}).sort("publish_date", -1))
    
    # Attach proposals count
    for t in tenders:
        t["proposals_count"] = db.proposals.count_documents({"tender_id": t["id"]})

    return {"success": True, "count": len(tenders), "data": tenders}


@app.get("/api/tenders/{tender_id}", tags=["Tenders"])
def get_tender(tender_id: str):
    """Retrieve full tender details, requirements, linked project metadata, and submitted proposals."""
    db = get_mongo_db()
    tender = db.tenders.find_one({"id": tender_id}, {"_id": 0})
    if not tender:
        raise HTTPException(status_code=404, detail=f"Tender '{tender_id}' not found")

    project = db.projects.find_one(
        {"id": tender.get("project_id")},
        {"_id": 0, "name": 1, "location": 1, "coordinates": 1, "current_stage": 1, "estimated_cost_cr": 1, "description": 1}
    )
    tender["project_summary"] = project
    tender["proposals"] = list(db.proposals.find({"tender_id": tender_id}, {"_id": 0}))

    return {"success": True, "data": tender}


@app.post("/api/tenders/{tender_id}/proposals", status_code=status.HTTP_201_CREATED, tags=["Tenders"])
def submit_proposal(tender_id: str, payload: ProposalSubmit):
    """Third-party company submits a basic proposal/bid for an open tender."""
    db = get_mongo_db()
    tender = db.tenders.find_one({"id": tender_id})
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    prop_id = f"PROP-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 100000}"
    now_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    prop_doc = {
        "id": prop_id,
        "tender_id": tender_id,
        "company_name": payload.company_name,
        "contact_email": payload.contact_email,
        "contact_phone": payload.contact_phone,
        "proposed_amount_cr": payload.proposed_amount_cr,
        "proposal_summary": payload.proposal_summary,
        "submission_date": now_date,
        "status": "UNDER_REVIEW",
        "documents": payload.documents or []
    }
    db.proposals.insert_one(prop_doc)

    log_audit_event(
        actor=payload.company_name,
        role="Vendor",
        action="SUBMIT_PROPOSAL",
        entity_type="tender",
        entity_id=tender_id,
        details=f"Company '{payload.company_name}' submitted proposal {prop_id} (₹{payload.proposed_amount_cr} Cr)."
    )

    created = db.proposals.find_one({"id": prop_id}, {"_id": 0})
    return {"success": True, "message": "Proposal submitted successfully", "data": created}


@app.get("/api/proposals", tags=["Tenders"])
def list_proposals(company_name: Optional[str] = None, tender_id: Optional[str] = None):
    """List proposals submitted by contractors."""
    db = get_mongo_db()
    query = {}
    if company_name:
        query["company_name"] = {"$regex": company_name, "$options": "i"}
    if tender_id:
        query["tender_id"] = tender_id

    proposals = list(db.proposals.find(query, {"_id": 0}).sort("submission_date", -1))
    return {"success": True, "count": len(proposals), "data": proposals}


# ============================================================================
# Evidence & Media Endpoints (P1.6, P1.12)
# ============================================================================

@app.post("/api/evidence/upload", status_code=status.HTTP_201_CREATED, tags=["Evidence"])
def upload_evidence(payload: EvidenceUpload):
    """Upload mock/local evidence attachments (images, testing documents) associated with an entity."""
    db = get_mongo_db()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    evidence_doc = {
        "id": f"EVD-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 100000}",
        "file_name": payload.file_name,
        "file_url": payload.file_url,
        "file_type": payload.file_type,
        "uploaded_by": payload.uploaded_by,
        "uploaded_at": now_iso,
        "entity_type": payload.entity_type,
        "entity_id": payload.entity_id,
        "caption": payload.caption or ""
    }

    # Attach to parent entity if applicable
    if payload.entity_type == "project":
        db.projects.update_one({"id": payload.entity_id}, {"$push": {"evidence": evidence_doc}})
    elif payload.entity_type == "issue":
        db.issues.update_one({"id": payload.entity_id}, {"$push": {"evidence": evidence_doc}})
    elif payload.entity_type == "maintenance":
        db.maintenance.update_one({"id": payload.entity_id}, {"$push": {"evidence": evidence_doc}})

    return {"success": True, "message": "Evidence uploaded successfully", "data": evidence_doc}


# ============================================================================
# In-App Notifications & Alerts (P1.11)
# ============================================================================

@app.get("/api/notifications", tags=["Notifications"])
def get_notifications(
    recipient_role: Optional[str] = None,
    district: Optional[str] = None,
    unread_only: bool = False
):
    """Retrieve operational notifications and critical alerts."""
    db = get_mongo_db()
    query = {}
    if recipient_role:
        query["recipient_role"] = recipient_role
    if district:
        query["district"] = district
    if unread_only:
        query["is_read"] = False

    notifications = list(db.notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(50))
    return {
        "success": True,
        "count": len(notifications),
        "unread_count": sum(1 for n in notifications if not n.get("is_read")),
        "data": notifications
    }


@app.post("/api/notifications/{notif_id}/read", tags=["Notifications"])
def mark_notification_read(notif_id: str):
    """Mark a notification as read."""
    db = get_mongo_db()
    db.notifications.update_one({"id": notif_id}, {"$set": {"is_read": True}})
    return {"success": True, "message": "Notification marked as read"}


# ============================================================================
# Audit Trail Endpoints (P1.12)
# ============================================================================

@app.get("/api/audit-logs", tags=["Audit Trail"])
def get_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    actor: Optional[str] = None,
    limit: int = 50
):
    """Retrieve system mutation audit logs (System/user modification history distinct from operational timeline)."""
    db = get_mongo_db()
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    if entity_id:
        query["entity_id"] = entity_id
    if actor:
        query["actor"] = {"$regex": actor, "$options": "i"}

    logs = list(db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit))
    return {"success": True, "count": len(logs), "data": logs}


# ============================================================================
# Citizen Endpoints (P1.10 Public Transparency Portal)
# ============================================================================

@app.get("/api/citizen/projects", tags=["Citizen Portal"])
def get_public_projects(search: Optional[str] = None, category: Optional[str] = None, district: Optional[str] = None):
    """Public transparency listing for citizens.
    Filters out internal operational disputes, internal change requests, and private evaluator details.
    """
    db = get_mongo_db()
    query = {"public_visible": True}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"district": {"$regex": search, "$options": "i"}}
        ]
    if category:
        query["category"] = category
    if district:
        query["district"] = district

    projection = {
        "_id": 0,
        "id": 1,
        "name": 1,
        "category": 1,
        "work_type": 1,
        "location": 1,
        "district": 1,
        "region": 1,
        "estimated_cost_cr": 1,
        "current_stage": 1,
        "lifecycle_status": 1,
        "quality_score": 1,
        "progress_percent": 1,
        "public_condition": 1,
        "expected_completion": 1,
        "description": 1,
        "status": 1
    }
    public_projects = list(db.projects.find(query, projection).sort("name", 1))
    return {"success": True, "count": len(public_projects), "data": public_projects}


@app.get("/api/citizen/projects/{project_id}", tags=["Citizen Portal"])
def get_public_project_detail(project_id: str):
    """Public transparency detail for citizens.
    Displays: project name, location, progress, public condition, milestones timeline, cost, contractor.
    Excludes: internal change requests, internal staff discussions, internal issue blame assignments.
    """
    db = get_mongo_db()
    projection = {
        "_id": 0,
        "id": 1,
        "name": 1,
        "category": 1,
        "work_type": 1,
        "location": 1,
        "coordinates": 1,
        "district": 1,
        "region": 1,
        "responsible_org": 1,
        "contractor": 1,
        "estimated_cost_cr": 1,
        "current_stage": 1,
        "lifecycle_status": 1,
        "quality_score": 1,
        "start_date": 1,
        "expected_completion": 1,
        "description": 1,
        "progress_percent": 1,
        "status": 1,
        "public_condition": 1,
        "lifecycle_stages": 1,
        "milestones": 1,
        "evidence": 1
    }
    project = db.projects.find_one({"id": project_id, "public_visible": True}, projection)
    if not project:
        raise HTTPException(status_code=404, detail="Public project record not found")

    return {"success": True, "data": project}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
