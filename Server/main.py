from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import datetime
from bson import ObjectId

from database import (
    get_mongo_db,
    init_mongodb,
    check_mongo_health,
    seed_database,
    MONGO_DATABASE
)

app = FastAPI(
    title="PRAVI — Gujarat R&B Infrastructure Monitoring API",
    description="Unified Project-Centric Infrastructure Monitoring & Contract Lifecycle Platform for Gujarat Roads & Buildings Department.",
    version="1.0.0",
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


class EvaluationSubmit(BaseModel):
    evaluator_name: Optional[str] = None
    metrics: Dict[str, Any] = Field(..., example={"Physical Progress": 62, "Quality": "Good", "Milestone Completion": "Not Completed"})
    observations: str = Field(..., example="Deck slab casting delayed due to reinforcement supply shortfall.")
    photos: Optional[List[str]] = Field(default_factory=list)


class TimelineAdvance(BaseModel):
    target_stage: str = Field(..., example="Action Initiated")
    actor: str = Field(..., example="Er. R. K. Patel (EE Ahmedabad)")
    notes: Optional[str] = Field(default="", example="Contractor instructed to mobilize additional hydraulic rig.")
    failed_verification: Optional[bool] = Field(default=False)


# ============================================================================
# Startup
# ============================================================================

@app.on_event("startup")
def startup_event():
    print("[Startup] Initializing PRAVI MongoDB...")
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
        "database": "MongoDB",
        "docs": "/docs",
        "status": "operational",
        "p0_features": [
            "Role-based views (State, District-1, District-2, Evaluator, Vendor, Citizen)",
            "Single Project Source of Truth",
            "Project Lifecycle Timeline",
            "SLA & Milestones Tracking",
            "Field Evaluation Workflow with Immutability",
            "Automated Rule Engine for Issue Detection",
            "Operational Timeline for Issue Resolution",
            "Third-Party Tenders",
            "Sanitized Citizen Transparency Portal"
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
    """Seed or reseed MongoDB with Gujarat R&B demo dataset."""
    res = seed_database(force=force)
    if not res["success"]:
        raise HTTPException(status_code=500, detail=res.get("error"))
    return res


# ============================================================================
# Organizational Hierarchy & Stats Endpoints
# ============================================================================

@app.get("/api/hierarchy", tags=["Hierarchy"])
def get_hierarchy():
    """Returns Gujarat State -> Regions -> Districts organizational hierarchy.
    IMPORTANT: Region is NOT an authority; it is only a grouping of districts.
    """
    db = get_mongo_db()
    regions = list(db.regions_districts.find({}, {"_id": 0}))
    return {
        "state": "Gujarat",
        "note": "Region is a geographic grouping container only. Authority belongs to State and respective District administrations.",
        "regions": regions
    }


@app.get("/api/stats", tags=["Dashboard Stats"])
def get_stats(district: Optional[str] = None, region: Optional[str] = None):
    """Aggregate statistics for State and District dashboards."""
    db = get_mongo_db()
    query = {}
    if district:
        query["district"] = district
    elif region:
        query["region"] = region

    projects = list(db.projects.find(query, {"_id": 0}))
    total_projects = len(projects)
    dev_count = sum(1 for p in projects if p.get("work_type") == "Development")
    maint_count = sum(1 for p in projects if p.get("work_type") == "Maintenance")
    delayed_projects = sum(1 for p in projects if p.get("status") == "Delayed")
    
    total_cost_cr = sum(p.get("estimated_cost_cr", 0.0) for p in projects)
    avg_progress = (sum(p.get("progress_percent", 0) for p in projects) / total_projects) if total_projects > 0 else 0

    # Issues query
    issue_query = {}
    if district:
        issue_query["district"] = district
    elif region:
        issue_query["region"] = region

    issues = list(db.issues.find(issue_query, {"_id": 0}))
    open_issues = sum(1 for i in issues if i.get("status") not in ["RESOLVED", "CLOSED"])
    critical_issues = sum(1 for i in issues if i.get("severity") == "Critical" and i.get("status") not in ["RESOLVED", "CLOSED"])

    # Evaluations query
    eval_query = {}
    if district:
        eval_query["district"] = district
    elif region:
        eval_query["region"] = region
    evals = list(db.evaluations.find(eval_query, {"_id": 0}))
    pending_evals = sum(1 for e in evals if e.get("status") == "assigned")

    # Tenders query
    tender_query = {}
    if district:
        tender_query["district"] = district
    tenders = list(db.tenders.find(tender_query, {"_id": 0}))

    return {
        "scope": {
            "state": "Gujarat",
            "region": region or "All Regions",
            "district": district or "All Districts"
        },
        "projects": {
            "total": total_projects,
            "development": dev_count,
            "maintenance": maint_count,
            "delayed": delayed_projects,
            "total_cost_cr": round(total_cost_cr, 2),
            "average_progress": round(avg_progress, 1)
        },
        "issues": {
            "total": len(issues),
            "open": open_issues,
            "critical": critical_issues,
            "resolved": sum(1 for i in issues if i.get("status") == "RESOLVED")
        },
        "evaluations": {
            "total": len(evals),
            "pending": pending_evals,
            "completed": sum(1 for e in evals if e.get("status") == "submitted")
        },
        "tenders": {
            "total": len(tenders),
            "active_bidding": sum(1 for t in tenders if t.get("status") == "Open for Bidding"),
            "awarded": sum(1 for t in tenders if t.get("status") == "Awarded")
        }
    }


# ============================================================================
# Projects Endpoints (Single Source of Truth)
# ============================================================================

@app.get("/api/projects", tags=["Projects"])
def list_projects(
    district: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    work_type: Optional[str] = None,
    stage: Optional[str] = None,
    search: Optional[str] = None
):
    """List projects with flexible filtering."""
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
    if stage:
        query["current_stage"] = stage
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


@app.get("/api/projects/{project_id}", tags=["Projects"])
def get_project(project_id: str):
    """Retrieve full single-source-of-truth project record, including active issues and evaluations."""
    db = get_mongo_db()
    project = db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found")

    # Fetch associated live issues and evaluations
    related_issues = list(db.issues.find({"project_id": project_id}, {"_id": 0}).sort("id", -1))
    related_evaluations = list(db.evaluations.find({"project_id": project_id}, {"_id": 0}).sort("due_date", -1))
    related_tenders = list(db.tenders.find({"project_id": project_id}, {"_id": 0}))

    project["live_issues"] = related_issues
    project["live_evaluations"] = related_evaluations
    project["live_tenders"] = related_tenders

    return {
        "success": True,
        "data": project
    }


@app.post("/api/projects", status_code=status.HTTP_201_CREATED, tags=["Projects"])
def create_project(payload: ProjectCreate):
    """Create a new project (District Employee ownership)."""
    db = get_mongo_db()
    existing = db.projects.find_one({"id": payload.id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Project ID '{payload.id}' already exists")

    doc = payload.model_dump()
    doc["public_visible"] = True
    doc["public_condition"] = "Proposed - Pending Approval"
    doc["lifecycle_stages"] = [
        {"stage": "Proposal", "status": "completed", "completed_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"), "note": "Created by District Employee"},
        {"stage": "State Approval", "status": "in_progress", "completed_at": None, "note": "Submitted for State Review"},
        {"stage": "Tender Proposal", "status": "upcoming", "completed_at": None},
        {"stage": "Tender Approval", "status": "upcoming", "completed_at": None},
        {"stage": "Contract / SLA", "status": "upcoming", "completed_at": None},
        {"stage": "Development", "status": "upcoming", "completed_at": None},
        {"stage": "Maintenance", "status": "upcoming", "completed_at": None}
    ]
    doc["milestones"] = []
    doc["evaluation_config"] = [
        {"parameter": "Physical Progress", "unit": "%", "monitoring_type": "Progress"},
        {"parameter": "Quality", "unit": "Grade", "options": ["Excellent", "Good", "Satisfactory", "Poor"], "monitoring_type": "Quality"},
        {"parameter": "Safety", "unit": "Status", "options": ["Compliant", "Minor Hazard", "Critical Hazard"], "monitoring_type": "Safety"},
        {"parameter": "Milestone Completion", "unit": "Status", "options": ["Completed", "On Schedule", "Not Completed"], "monitoring_type": "Schedule"}
    ]
    doc["monitoring_rules"] = [
        {"id": "rule-auto-1", "parameter": "Milestone Completion", "operator": "equals", "threshold_value": "Not Completed", "action": "create_issue", "issue_title": "Milestone not completed within schedule", "severity": "Critical"},
        {"id": "rule-auto-2", "parameter": "Quality", "operator": "equals", "threshold_value": "Poor", "action": "create_issue", "issue_title": "Field quality audit reported Poor", "severity": "Critical"}
    ]
    doc["change_requests"] = []
    doc["comments"] = []

    db.projects.insert_one(doc)
    created = db.projects.find_one({"id": payload.id}, {"_id": 0})
    return {"success": True, "message": "Project created successfully", "data": created}


@app.patch("/api/projects/{project_id}", tags=["Projects"])
def update_project(project_id: str, payload: ProjectUpdate):
    """Update project information (District Employee ownership)."""
    db = get_mongo_db()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    result = db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

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
    """State Authority creates a change request for a district-owned project (Oversight without direct modification)."""
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
# Field Evaluations & Automated Rule Engine Endpoints
# ============================================================================

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
    """Get single evaluation record with configured parameters from the parent project."""
    db = get_mongo_db()
    evaluation = db.evaluations.find_one({"id": eval_id}, {"_id": 0})
    if not evaluation:
        raise HTTPException(status_code=404, detail=f"Evaluation '{eval_id}' not found")

    # Load project's evaluation config and rules
    project = db.projects.find_one({"id": evaluation["project_id"]}, {"_id": 0, "evaluation_config": 1, "monitoring_rules": 1, "milestones": 1})
    evaluation["project_evaluation_config"] = project.get("evaluation_config", []) if project else []
    evaluation["project_monitoring_rules"] = project.get("monitoring_rules", []) if project else []

    return {"success": True, "data": evaluation}


@app.post("/api/evaluations/{eval_id}/submit", tags=["Evaluations"])
def submit_evaluation(eval_id: str, payload: EvaluationSubmit):
    """Submit evaluation observations by Evaluator.
    Core Workflow:
    1. Evaluator submits ground truth metrics.
    2. Record becomes immutable (cannot be modified afterwards).
    3. Automated Rule Engine checks project rules.
    4. If rule triggers -> Automatic Issue creation with Operational Timeline!
    """
    db = get_mongo_db()
    evaluation = db.evaluations.find_one({"id": eval_id})
    if not evaluation:
        raise HTTPException(status_code=404, detail=f"Evaluation '{eval_id}' not found")

    # Check immutability principle (Section 20 & 41)
    if evaluation.get("is_immutable") or evaluation.get("status") == "submitted":
        raise HTTPException(
            status_code=400,
            detail="Evaluation has already been submitted and is immutable. Historical records cannot be modified."
        )

    project_id = evaluation["project_id"]
    project = db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Parent project not found")

    monitoring_rules = project.get("monitoring_rules", [])
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    now_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    triggered_rules = []
    created_issues = []

    # ========================================================================
    # Rule Engine Evaluation
    # ========================================================================
    for rule in monitoring_rules:
        param = rule.get("parameter")
        op = rule.get("operator")
        threshold = rule.get("threshold_value")
        observed = payload.metrics.get(param)

        rule_matched = False
        if observed is not None:
            if op == "equals" and str(observed).lower().strip() == str(threshold).lower().strip():
                rule_matched = True
            elif op == "less_than":
                try:
                    if float(observed) < float(threshold):
                        rule_matched = True
                except (ValueError, TypeError):
                    pass
            elif op == "greater_than":
                try:
                    if float(observed) > float(threshold):
                        rule_matched = True
                except (ValueError, TypeError):
                    pass

        if rule_matched:
            triggered_rules.append(rule.get("id"))
            # Generate automated issue
            issue_id = f"ISSUE-{int(datetime.datetime.now(datetime.timezone.utc).timestamp()) % 100000}"
            issue_doc = {
                "id": issue_id,
                "project_id": project_id,
                "project_name": project.get("name"),
                "district": project.get("district"),
                "region": project.get("region"),
                "evaluation_id": eval_id,
                "title": rule.get("issue_title", f"Rule exception detected on {param}"),
                "parameter": param,
                "observed_value": str(observed),
                "severity": rule.get("severity", "Critical"),
                "detected_date": now_date,
                "responsible_org": project.get("responsible_org"),
                "responsible_employee": project.get("responsible_employee"),
                "status": "OPEN",
                "resolution_notes": "",
                "operational_timeline": [
                    {
                        "stage": "Detected",
                        "timestamp": now_iso,
                        "actor": "System (Automated Rule Engine)",
                        "status": "completed",
                        "details": f"Evaluation {eval_id} flagged {param} = '{observed}' breaching Rule #{rule.get('id')}."
                    },
                    {
                        "stage": "Assigned",
                        "timestamp": now_iso,
                        "actor": project.get("responsible_employee"),
                        "status": "in_progress",
                        "details": f"Automatically assigned to {project.get('responsible_org')} for immediate review."
                    },
                    {
                        "stage": "Under Review",
                        "timestamp": None,
                        "actor": "District Engineering Cell",
                        "status": "upcoming",
                        "details": "Conduct root-cause analysis and contractor coordination."
                    },
                    {
                        "stage": "Action Initiated",
                        "timestamp": None,
                        "actor": project.get("contractor"),
                        "status": "upcoming",
                        "details": "Deploy corrective engineering measures on site."
                    },
                    {
                        "stage": "Resolution Submitted",
                        "timestamp": None,
                        "actor": project.get("responsible_employee"),
                        "status": "upcoming",
                        "details": "Submit formal rectification report with field proof."
                    },
                    {
                        "stage": "Verification",
                        "timestamp": None,
                        "actor": "Independent Quality Monitor",
                        "status": "upcoming",
                        "details": "Re-audit site condition to verify full rectification."
                    },
                    {
                        "stage": "Resolved",
                        "timestamp": None,
                        "actor": "Superintendent Engineer",
                        "status": "upcoming",
                        "details": "Executive approval and issue closure."
                    }
                ]
            }
            db.issues.insert_one(issue_doc)
            created_issues.append(serialize_mongo_doc(issue_doc))

    # Mark evaluation submitted & immutable
    generated_issue_id = created_issues[0]["id"] if created_issues else None
    update_eval = {
        "status": "submitted",
        "submitted_at": now_iso,
        "is_immutable": True,
        "metrics": payload.metrics,
        "observations": payload.observations,
        "photos": payload.photos or [],
        "rules_triggered": triggered_rules,
        "generated_issue_id": generated_issue_id
    }
    if payload.evaluator_name:
        update_eval["evaluator_name"] = payload.evaluator_name

    db.evaluations.update_one({"id": eval_id}, {"$set": update_eval})

    # If an issue was created, also update project status to 'Delayed' or 'Under Review'
    if created_issues:
        db.projects.update_one(
            {"id": project_id},
            {"$set": {"status": "Delayed"}}
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
# Issues & Operational Timeline Endpoints
# ============================================================================

@app.get("/api/issues", tags=["Issues"])
def list_issues(
    district: Optional[str] = None,
    region: Optional[str] = None,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None
):
    """List issues filterable by district, project, status, severity."""
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

    issues = list(db.issues.find(query, {"_id": 0}).sort("id", -1))
    return {"success": True, "count": len(issues), "data": issues}


@app.get("/api/issues/{issue_id}", tags=["Issues"])
def get_issue(issue_id: str):
    """Retrieve issue detail with its complete Operational Timeline."""
    db = get_mongo_db()
    issue = db.issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue '{issue_id}' not found")
    return {"success": True, "data": issue}


@app.post("/api/issues/{issue_id}/timeline-advance", tags=["Issues"])
def advance_operational_timeline(issue_id: str, payload: TimelineAdvance):
    """Advance the issue resolution through its Operational Timeline:
    Detected -> Assigned -> Under Review -> Action Initiated -> Resolution Submitted -> Verification -> Resolved
    If verification fails, reverts to Action Initiated as per Section 23!
    """
    db = get_mongo_db()
    issue = db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue '{issue_id}' not found")

    timeline = issue.get("operational_timeline", [])
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    target_stage = payload.target_stage

    # Handle Verification Failure scenario (Section 23 in Context.md)
    if payload.failed_verification:
        # Revert back to Action Initiated
        for step in timeline:
            if step["stage"] == "Verification":
                step["status"] = "failed"
                step["details"] = f"Verification failed by {payload.actor}: {payload.notes}. Reverted to Action Initiated."
                step["timestamp"] = now_iso
            elif step["stage"] == "Action Initiated":
                step["status"] = "in_progress"
                step["timestamp"] = now_iso
                step["details"] = f"Corrective action re-initiated following verification failure."
            elif step["stage"] in ["Resolution Submitted", "Resolved"]:
                step["status"] = "upcoming"
                step["timestamp"] = None

        new_status = "ACTION INITIATED"
        notes = f"Verification failed. {payload.notes}"
    else:
        # Normal sequential progression
        found_target = False
        for step in timeline:
            if step["stage"] == target_stage:
                step["status"] = "completed" if target_stage == "Resolved" else "in_progress"
                step["timestamp"] = now_iso
                step["actor"] = payload.actor
                if payload.notes:
                    step["details"] = payload.notes
                found_target = True
            elif not found_target:
                step["status"] = "completed"
            else:
                step["status"] = "upcoming"

        stage_to_status_map = {
            "Detected": "OPEN",
            "Assigned": "ASSIGNED",
            "Under Review": "UNDER REVIEW",
            "Action Initiated": "ACTION INITIATED",
            "Resolution Submitted": "RESOLUTION SUBMITTED",
            "Verification": "VERIFICATION",
            "Resolved": "RESOLVED"
        }
        new_status = stage_to_status_map.get(target_stage, "IN PROGRESS")
        notes = payload.notes or issue.get("resolution_notes", "")

    db.issues.update_one(
        {"id": issue_id},
        {"$set": {
            "status": new_status,
            "operational_timeline": timeline,
            "resolution_notes": notes,
            "last_updated": now_iso
        }}
    )

    # If resolved, check if all project issues are resolved to restore project status
    if new_status == "RESOLVED":
        project_id = issue["project_id"]
        unresolved = db.issues.count_documents({
            "project_id": project_id,
            "status": {"$ne": "RESOLVED"}
        })
        if unresolved == 0:
            db.projects.update_one(
                {"id": project_id},
                {"$set": {"status": "Active"}}
            )

    updated_issue = db.issues.find_one({"id": issue_id}, {"_id": 0})
    return {
        "success": True,
        "message": f"Operational timeline advanced to '{target_stage}'.",
        "data": updated_issue
    }


# ============================================================================
# Tenders Endpoints (Third-Party Company / Vendor Actor)
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
    return {"success": True, "count": len(tenders), "data": tenders}


@app.get("/api/tenders/{tender_id}", tags=["Tenders"])
def get_tender(tender_id: str):
    """Retrieve full tender details, eligibility criteria, and linked project metadata."""
    db = get_mongo_db()
    tender = db.tenders.find_one({"id": tender_id}, {"_id": 0})
    if not tender:
        raise HTTPException(status_code=404, detail=f"Tender '{tender_id}' not found")

    # Link project summary
    project = db.projects.find_one({"id": tender["project_id"]}, {"_id": 0, "name": 1, "location": 1, "coordinates": 1, "current_stage": 1, "estimated_cost_cr": 1})
    tender["project_summary"] = project

    return {"success": True, "data": tender}


# ============================================================================
# Citizen Endpoints (Public Transparency Portal)
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
        "start_date": 1,
        "expected_completion": 1,
        "description": 1,
        "progress_percent": 1,
        "status": 1,
        "public_condition": 1,
        "lifecycle_stages": 1,
        "milestones": 1
    }
    project = db.projects.find_one({"id": project_id, "public_visible": True}, projection)
    if not project:
        raise HTTPException(status_code=404, detail="Public project record not found")

    return {"success": True, "data": project}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
