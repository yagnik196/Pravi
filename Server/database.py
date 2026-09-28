import os
import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List

# Load environment variables
load_dotenv()

# MongoDB Configuration (pure MongoDB, supports MongoDB Atlas)
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://127.0.0.1:27017"
MONGO_DATABASE = os.getenv("MONGO_DATABASE") or os.getenv("MONGODB_DATABASE") or "pravi_db"

_mongo_client: Optional[MongoClient] = None

def get_mongo_client() -> MongoClient:
    """Return a singleton or shared MongoClient instance with connection pooling."""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
    return _mongo_client

def get_mongo_db():
    """Return the MongoDB database instance."""
    client = get_mongo_client()
    return client[MONGO_DATABASE]

def check_mongo_health() -> Dict[str, Any]:
    """Check connectivity to MongoDB and return status dict."""
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        return {
            "status": "connected",
            "database": MONGO_DATABASE,
            "uri": MONGO_URI,
            "error": None
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "database": MONGO_DATABASE,
            "uri": MONGO_URI,
            "error": str(e)
        }


# ============================================================================
# Audit Logging & Notification Utilities
# ============================================================================

def log_audit_event(
    actor: str,
    role: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: str,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None
) -> Dict[str, Any]:
    """Record an immutable audit log entry for compliance and tracking."""
    try:
        db = get_mongo_db()
        audit_doc = {
            "id": f"AUD-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 1000000}",
            "actor": actor,
            "role": role,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details,
            "old_value": str(old_value) if old_value is not None else None,
            "new_value": str(new_value) if new_value is not None else None,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        db.audit_logs.insert_one(audit_doc)
        return audit_doc
    except Exception as e:
        print(f"[Audit Log Error] {e}")
        return {}


def create_notification(
    recipient_role: str,
    district: Optional[str],
    notif_type: str,
    title: str,
    message: str,
    entity_type: str,
    entity_id: str
) -> Dict[str, Any]:
    """Create an in-app operational notification."""
    try:
        db = get_mongo_db()
        notif_doc = {
            "id": f"NOTIF-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000) % 1000000}",
            "recipient_role": recipient_role,
            "district": district,
            "type": notif_type,
            "title": title,
            "message": message,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "is_read": False,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        db.notifications.insert_one(notif_doc)
        return notif_doc
    except Exception as e:
        print(f"[Notification Error] {e}")
        return {}


# ============================================================================
# Seed Data Definitions
# ============================================================================

SEED_REGIONS = [
    {
        "region": "Ahmedabad Region",
        "description": "Administrative grouping covering Central-North Gujarat corridor",
        "districts": ["Ahmedabad", "Gandhinagar", "Mehsana"]
    },
    {
        "region": "Surat Region",
        "description": "Administrative grouping covering South Gujarat industrial and coastal belt",
        "districts": ["Surat", "Bharuch", "Navsari"]
    },
    {
        "region": "Rajkot Region",
        "description": "Administrative grouping covering Saurashtra arterial highways and ports",
        "districts": ["Rajkot", "Jamnagar", "Bhavnagar"]
    },
    {
        "region": "Vadodara Region",
        "description": "Administrative grouping covering Central-East agricultural and institutional corridor",
        "districts": ["Vadodara", "Anand", "Panchmahal"]
    }
]

SEED_PROJECTS = [
    {
        "id": "RNB-2026-001",
        "asset_id": "RNB-2026-001",
        "name": "Ahmedabad Ring Road Development Phase 2",
        "category": "Road",
        "work_type": "Development",
        "state": "Gujarat",
        "region": "Ahmedabad Region",
        "district": "Ahmedabad",
        "location": "Sardar Patel Ring Road to SG Highway Corridor, Ahmedabad",
        "coordinates": {"lat": 23.0338, "lng": 72.5850},
        "responsible_org": "Roads & Buildings Circle Ahmedabad",
        "responsible_employee": "Er. R. K. Patel (Executive Engineer)",
        "superintendent_engineer": "Er. S. M. Trivedi (Superintendent Engineer)",
        "contractor": "ABC Infrastructure Ltd.",
        "estimated_cost_cr": 120.0,
        "current_stage": "Development",
        "lifecycle_status": "UNDER_DEVELOPMENT",
        "health_status": "Critical",
        "quality_score": 48,
        "start_date": "2026-01-15",
        "expected_completion": "2026-11-30",
        "description": "Six-lane arterial ring road corridor connecting SP Ring Road to SG Highway with dedicated service roads, grade separator flyover, and integrated storm drainage.",
        "priority": "High",
        "status": "Delayed",
        "progress_percent": 62,
        "public_visible": True,
        "public_condition": "Critical Alert - Pothole and structural slab remediation active near SG Highway junction",
        "metrics_current": {
            "Road Quality": 48,
            "Structural Defect Score": 72,
            "Pothole Density": 18,
            "Surface Damage Index": 65,
            "Drainage Condition": 55
        },
        "lifecycle_stages": [
            {"stage": "Proposal", "status": "completed", "completed_at": "2025-08-10", "note": "Initial DPR submitted by Executive Engineer, Ahmedabad Circle"},
            {"stage": "State Approval", "status": "completed", "completed_at": "2025-09-02", "note": "Administrative Approval #RND-GUJ-8812 sanctioned by Secretary, R&B Gandhinagar"},
            {"stage": "Tender Proposal", "status": "completed", "completed_at": "2025-10-14", "note": "Notice Inviting Tender published on Gujarat e-Procurement Portal"},
            {"stage": "Tender Approval", "status": "completed", "completed_at": "2025-12-20", "note": "Technical & Financial bid sanctioned; awarded to ABC Infrastructure Ltd."},
            {"stage": "Contract / SLA", "status": "completed", "completed_at": "2026-01-10", "note": "Tripartite contract signed with 4 milestone performance SLAs and defect liability commitments"},
            {"stage": "Development", "status": "in_progress", "completed_at": None, "note": "Active civil works in progress (62% physical completion; structural delay detected)"},
            {"stage": "Maintenance", "status": "upcoming", "completed_at": None, "note": "5-year Defect Liability & Comprehensive Road Asset Maintenance"}
        ],
        "milestones": [
            {
                "id": "m1",
                "name": "Foundation & Sub-base Work",
                "description": "Earthwork compaction, sub-grade stabilization, and granular sub-base preparation for 18.5 km",
                "expected_date": "2026-04-30",
                "status": "completed",
                "progress_percent": 100,
                "evaluation_required": True
            },
            {
                "id": "m2",
                "name": "Structure & Flyover Deck Slab",
                "description": "Pier casting, precast girder launching, and deck slab casting for SG Highway grade separator",
                "expected_date": "2026-08-30",
                "status": "delayed",
                "progress_percent": 75,
                "evaluation_required": True
            },
            {
                "id": "m3",
                "name": "Bituminous Road Surfacing & Kerbs",
                "description": "Dense Bituminous Macadam (DBM) and Bituminous Concrete (BC) wearing coat",
                "expected_date": "2026-10-25",
                "status": "upcoming",
                "progress_percent": 15,
                "evaluation_required": True
            },
            {
                "id": "m4",
                "name": "Final Signage, Lighting & Safety Audit",
                "description": "Retro-reflective signage, high-mast LED illumination, metal beam crash barriers, and independent road safety audit",
                "expected_date": "2026-11-30",
                "status": "upcoming",
                "progress_percent": 0,
                "evaluation_required": True
            }
        ],
        "evaluation_config": [
            {"parameter": "Road Quality", "unit": "Score (0-100)", "monitoring_type": "Quality", "target_description": "Standard riding comfort and pavement integrity score >= 60"},
            {"parameter": "Physical Progress", "unit": "%", "monitoring_type": "Progress", "target_description": "Expected >= 70% for current milestone schedule"},
            {"parameter": "Quality", "unit": "Grade", "monitoring_type": "Quality", "options": ["Excellent", "Good", "Satisfactory", "Poor"], "target_description": "M40 concrete cube test compressive strength >= 40 MPa"},
            {"parameter": "Safety", "unit": "Status", "monitoring_type": "Safety", "options": ["Compliant", "Minor Hazard", "Critical Hazard"], "target_description": "Zero non-compliance on traffic diversion barricades and PPE"},
            {"parameter": "Milestone Completion", "unit": "Status", "monitoring_type": "Schedule", "options": ["Completed", "On Schedule", "Not Completed"], "target_description": "Deliverable handed over within SLA timeframe"}
        ],
        "monitoring_rules": [
            {
                "id": "RULE-RQ-60",
                "metric": "Road Quality",
                "parameter": "Road Quality",
                "operator": "<",
                "threshold_value": 60,
                "action": "create_issue",
                "issue_title": "Road Quality fell below minimum threshold (60)",
                "description": "Road Quality dropped below 60. Automatically triggers critical exception and notifies district.",
                "severity": "Critical"
            },
            {
                "id": "RULE-PD-15",
                "metric": "Pothole Density",
                "parameter": "Pothole Density",
                "operator": ">",
                "threshold_value": 15,
                "action": "create_issue",
                "issue_title": "Pothole density exceeds allowable limit (15/km)",
                "description": "Severe surface distress with dangerous wheel impact risks.",
                "severity": "Warning"
            },
            {
                "id": "rule-1",
                "metric": "Milestone Completion",
                "parameter": "Milestone Completion",
                "operator": "=",
                "threshold_value": "Not Completed",
                "action": "create_issue",
                "issue_title": "Development milestone #2 structure not completed",
                "description": "Critical milestone delivery breached schedule window.",
                "severity": "Critical"
            },
            {
                "id": "rule-2",
                "metric": "Quality",
                "parameter": "Quality",
                "operator": "=",
                "threshold_value": "Poor",
                "action": "create_issue",
                "issue_title": "Construction quality rated Poor by field auditor",
                "description": "Structural defect detected during field core sample audit.",
                "severity": "Critical"
            }
        ],
        "evidence": [
            {
                "file_name": "ahmedabad_pier14_slab.jpg",
                "file_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg",
                "caption": "Pier 14 Deck Slab Reinforcement Inspection",
                "uploaded_by": "Er. Pravin Varma (SQM)",
                "uploaded_at": "2026-09-25T09:25:00Z"
            }
        ],
        "change_requests": [
            {
                "id": "CR-2026-004",
                "requested_by": "State Authority (Chief Engineer, R&B Gandhinagar)",
                "requested_at": "2026-09-24T14:30:00Z",
                "message": "Please update the expected completion date and submit revised milestone resource deployment based on latest field evaluation E-204.",
                "status": "Pending",
                "district_response": None
            }
        ],
        "comments": [
            {
                "id": "c1",
                "author": "Er. H. Dave (State Oversight)",
                "role": "State",
                "timestamp": "2026-09-25T09:15:00Z",
                "message": "Superintendent Engineer Ahmedabad to expedite contractor crane deployment for SG Highway grade separator."
            },
            {
                "id": "c2",
                "author": "Er. R. K. Patel (EE Ahmedabad)",
                "role": "District-1",
                "timestamp": "2026-09-25T11:40:00Z",
                "message": "Notice issued to ABC Infrastructure. Additional hydraulic piling rig mobilized."
            }
        ]
    },
    {
        "id": "RNB-2026-002",
        "asset_id": "RNB-2026-002",
        "name": "Surat Cable Bridge & Riverfront Approach Rehabilitation",
        "category": "Bridge",
        "work_type": "Maintenance",
        "state": "Gujarat",
        "region": "Surat Region",
        "district": "Surat",
        "location": "Tapi River Cable-Stayed Bridge, Athwa-Adajan Corridor, Surat",
        "coordinates": {"lat": 21.1702, "lng": 72.8311},
        "responsible_org": "Surat City R&B Division",
        "responsible_employee": "Er. M. S. Vora (Executive Engineer)",
        "superintendent_engineer": "Er. V. P. Mehta (Superintendent Engineer)",
        "contractor": "L&T Heavy Civil Infrastructure",
        "estimated_cost_cr": 48.5,
        "current_stage": "Maintenance",
        "lifecycle_status": "UNDER_MAINTENANCE",
        "health_status": "Warning",
        "quality_score": 76,
        "start_date": "2025-06-01",
        "expected_completion": "2027-05-31",
        "description": "Continuous structural health monitoring, stay-cable tension damping inspection, elastomeric bearing replacement, and deck re-surfacing on Tapi River Cable Stayed Bridge.",
        "priority": "High",
        "status": "Active",
        "progress_percent": 45,
        "public_visible": True,
        "public_condition": "Operational - Scheduled Maintenance Active (Lane 2 Night Diversion)",
        "metrics_current": {
            "Bridge Structural Condition": 76,
            "Expansion Joint Condition": 42,
            "Vibration Damping Score": 88,
            "Drainage & Joint Seal": "Poor",
            "Public Safety": "Caution"
        },
        "lifecycle_stages": [
            {"stage": "Proposal", "status": "completed", "completed_at": "2025-01-10", "note": "Surat bridge condition assessment proposed periodic rehabilitation"},
            {"stage": "State Approval", "status": "completed", "completed_at": "2025-02-18", "note": "Approved under Gujarat State Urban Infrastructure Maintenance Scheme"},
            {"stage": "Tender Proposal", "status": "completed", "completed_at": "2025-03-25", "note": "Specialized cable-stayed bridge maintenance tender floated"},
            {"stage": "Tender Approval", "status": "completed", "completed_at": "2025-05-12", "note": "Awarded to L&T Heavy Civil Infrastructure"},
            {"stage": "Contract / SLA", "status": "completed", "completed_at": "2025-05-28", "note": "24-month maintenance contract with continuous strain-sensor telemetry SLA"},
            {"stage": "Development", "status": "completed", "completed_at": "2025-06-01", "note": "Transitioned directly to active maintenance regimen"},
            {"stage": "Maintenance", "status": "in_progress", "completed_at": None, "note": "Ongoing quarterly vibration, joint and corrosion inspection cycles"}
        ],
        "milestones": [
            {
                "id": "surat-m1",
                "name": "Acoustic Stay-Cable Tension Test",
                "description": "Laser vibrometry and ultrasonic inspection of all 152 stay cables",
                "expected_date": "2026-03-31",
                "status": "completed",
                "progress_percent": 100,
                "evaluation_required": True
            },
            {
                "id": "surat-m2",
                "name": "Expansion Joint 4 Elastomeric Seal Replacement",
                "description": "Heavy-duty expansion modular joint replacement to halt water infiltration to pier cap",
                "expected_date": "2026-09-15",
                "status": "delayed",
                "progress_percent": 60,
                "evaluation_required": True
            },
            {
                "id": "surat-m3",
                "name": "Pylon Corrosion Protection Coating",
                "description": "Anti-carbonation, epoxy-polyurethane protective coat on concrete pylon surface",
                "expected_date": "2026-12-15",
                "status": "upcoming",
                "progress_percent": 10,
                "evaluation_required": True
            }
        ],
        "evaluation_config": [
            {"parameter": "Bridge Structural Condition", "unit": "Score (0-100)", "monitoring_type": "Condition", "target_description": "Vibration and ultrasonic integrity score >= 70"},
            {"parameter": "Expansion Joint Condition", "unit": "Score (0-100)", "monitoring_type": "Quality", "target_description": "Modular joint seal water-tightness >= 50"},
            {"parameter": "Drainage & Joint Seal", "unit": "Status", "monitoring_type": "Quality", "options": ["Good", "Satisfactory", "Poor"], "target_description": "Water-tight expansion seal without debris clogging"},
            {"parameter": "Public Safety", "unit": "Status", "monitoring_type": "Safety", "options": ["Safe", "Caution", "Hazard"], "target_description": "Anti-skid wearing coat intact on vehicle lanes"}
        ],
        "monitoring_rules": [
            {
                "id": "RULE-EJ-50",
                "metric": "Expansion Joint Condition",
                "parameter": "Expansion Joint Condition",
                "operator": "<",
                "threshold_value": 50,
                "action": "create_issue",
                "issue_title": "Expansion joint seal degradation causing water ponding",
                "description": "Joint seal rating below 50. Replacement modular profile needed.",
                "severity": "Warning"
            },
            {
                "id": "rule-surat-2",
                "metric": "Drainage & Joint Seal",
                "parameter": "Drainage & Joint Seal",
                "operator": "=",
                "threshold_value": "Poor",
                "action": "create_issue",
                "issue_title": "Expansion Joint 4 Elastomeric Seal Degradation",
                "description": "Flagged Poor in visual inspection.",
                "severity": "Warning"
            }
        ],
        "evidence": [
            {
                "file_name": "surat_bridge_joint4.jpg",
                "file_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg",
                "caption": "Pier 4 Expansion Modular Joint Wear Profile",
                "uploaded_by": "Er. Jagdish Mehta (NDT Specialist)",
                "uploaded_at": "2026-09-27T08:30:00Z"
            }
        ],
        "change_requests": [],
        "comments": [
            {
                "id": "c-surat-1",
                "author": "Er. M. S. Vora (EE Surat)",
                "role": "District-2",
                "timestamp": "2026-09-20T10:00:00Z",
                "message": "Joint modular seal delivery arrived from Germany; night closure planned for replacement."
            }
        ]
    },
    {
        "id": "RNB-2026-003",
        "asset_id": "RNB-2026-003",
        "name": "Vadodara Government Secretariat Complex Expansion",
        "category": "Building",
        "work_type": "Development",
        "state": "Gujarat",
        "region": "Vadodara Region",
        "district": "Vadodara",
        "location": "Kothi Compound, Collectorate Campus, Vadodara",
        "coordinates": {"lat": 22.3072, "lng": 73.1812},
        "responsible_org": "Vadodara R&B Building Division",
        "responsible_employee": "Er. K. B. Shah (Executive Engineer)",
        "superintendent_engineer": "Er. D. N. Joshi (Superintendent Engineer)",
        "contractor": "Adani Concessions Ltd.",
        "estimated_cost_cr": 84.0,
        "current_stage": "Development",
        "lifecycle_status": "UNDER_DEVELOPMENT",
        "health_status": "Healthy",
        "quality_score": 88,
        "start_date": "2025-11-15",
        "expected_completion": "2027-02-28",
        "description": "G+8 multi-department institutional complex with green building GRIHA 4-star compliance, solar rooftop, and automated subterranean parking.",
        "priority": "Medium",
        "status": "Active",
        "progress_percent": 38,
        "public_visible": True,
        "public_condition": "Civil Superstructure Framing (4th Floor) - On Schedule",
        "metrics_current": {
            "Structural Concrete Quality": "Good",
            "Site Safety Index": 94,
            "Progress Rate": 38
        },
        "lifecycle_stages": [
            {"stage": "Proposal", "status": "completed", "completed_at": "2025-05-10"},
            {"stage": "State Approval", "status": "completed", "completed_at": "2025-07-20"},
            {"stage": "Tender Proposal", "status": "completed", "completed_at": "2025-09-12"},
            {"stage": "Tender Approval", "status": "completed", "completed_at": "2025-10-30"},
            {"stage": "Contract / SLA", "status": "completed", "completed_at": "2025-11-10"},
            {"stage": "Development", "status": "in_progress", "completed_at": None},
            {"stage": "Maintenance", "status": "upcoming", "completed_at": None}
        ],
        "milestones": [
            {"id": "v-m1", "name": "Basement Excavation & Raft Foundation", "expected_date": "2026-03-15", "status": "completed", "progress_percent": 100},
            {"id": "v-m2", "name": "RCC Framed Structure up to 4th Floor", "expected_date": "2026-08-31", "status": "completed", "progress_percent": 100},
            {"id": "v-m3", "name": "Superstructure Framing up to 8th Floor", "expected_date": "2026-12-31", "status": "in_progress", "progress_percent": 40}
        ],
        "evaluation_config": [
            {"parameter": "Structural Concrete Quality", "unit": "Grade", "options": ["Excellent", "Good", "Poor"]}
        ],
        "monitoring_rules": [
            {"id": "rule-v-1", "parameter": "Structural Concrete Quality", "operator": "=", "threshold_value": "Poor", "action": "create_issue", "issue_title": "Cube test failure on column batch", "severity": "Critical"}
        ],
        "evidence": [],
        "change_requests": [],
        "comments": []
    },
    {
        "id": "RNB-2026-004",
        "asset_id": "RNB-2026-004",
        "name": "Rajkot-Morbi 4-Lane Industrial Highway Modernization",
        "category": "Road",
        "work_type": "Development",
        "state": "Gujarat",
        "region": "Rajkot Region",
        "district": "Rajkot",
        "location": "State Highway 24, Rajkot to Morbi Ceramic Cluster",
        "coordinates": {"lat": 22.3039, "lng": 70.8022},
        "responsible_org": "Rajkot Highway Division R&B",
        "responsible_employee": "Er. P. C. Solanki (Executive Engineer)",
        "superintendent_engineer": "Er. A. T. Rathod (Superintendent Engineer)",
        "contractor": "Pending Tender Sanction",
        "estimated_cost_cr": 210.0,
        "current_stage": "Proposal",
        "lifecycle_status": "TENDERED",
        "health_status": "Warning",
        "quality_score": 42,
        "start_date": "2026-12-01",
        "expected_completion": "2028-11-30",
        "description": "Widening 64 km heavy industrial highway into 4 lanes with rigid concrete pavement suited for 50-tonne ceramic transport vehicles.",
        "priority": "High",
        "status": "Active",
        "progress_percent": 5,
        "public_visible": True,
        "public_condition": "Under State Administrative Review & Open Competitive Tender",
        "metrics_current": {
            "Pavement Distress Index": 58,
            "Traffic Saturation": "High"
        },
        "lifecycle_stages": [
            {"stage": "Proposal", "status": "in_progress", "completed_at": None, "note": "DPR under review by State Finance Committee"},
            {"stage": "State Approval", "status": "upcoming", "completed_at": None},
            {"stage": "Tender Proposal", "status": "upcoming", "completed_at": None},
            {"stage": "Tender Approval", "status": "upcoming", "completed_at": None},
            {"stage": "Contract / SLA", "status": "upcoming", "completed_at": None},
            {"stage": "Development", "status": "upcoming", "completed_at": None},
            {"stage": "Maintenance", "status": "upcoming", "completed_at": None}
        ],
        "milestones": [],
        "evaluation_config": [],
        "monitoring_rules": [],
        "evidence": [],
        "change_requests": [],
        "comments": []
    },
    {
        "id": "RNB-2026-005",
        "asset_id": "RNB-2026-005",
        "name": "Gandhinagar VIP Sector Road Resurfacing & Green Corridor",
        "category": "Road",
        "work_type": "Maintenance",
        "state": "Gujarat",
        "region": "Ahmedabad Region",
        "district": "Gandhinagar",
        "location": "CH-Road to GH-Road, Sector 1-10 Axis, Gandhinagar Capital Complex",
        "coordinates": {"lat": 23.2156, "lng": 72.6369},
        "responsible_org": "Capital Project Division-1 R&B Gandhinagar",
        "responsible_employee": "Er. N. K. Chauhan (Executive Engineer)",
        "superintendent_engineer": "Er. S. M. Trivedi (Superintendent Engineer)",
        "contractor": "Gujarat State Road Development Corporation (GSRDC)",
        "estimated_cost_cr": 18.2,
        "current_stage": "Maintenance",
        "lifecycle_status": "OPERATIONAL",
        "health_status": "Healthy",
        "quality_score": 91,
        "start_date": "2026-02-01",
        "expected_completion": "2026-10-31",
        "description": "Ultra-thin white topping and asphalt milling resurfacing along state capital ceremonial corridors.",
        "priority": "Medium",
        "status": "Active",
        "progress_percent": 82,
        "public_visible": True,
        "public_condition": "Near Completion - Wearing Course Finished (91% Quality Index)",
        "metrics_current": {
            "Road Quality": 91,
            "Riding Quality Index": 94,
            "Surface Damage Index": 8
        },
        "lifecycle_stages": [
            {"stage": "Proposal", "status": "completed", "completed_at": "2025-11-01"},
            {"stage": "State Approval", "status": "completed", "completed_at": "2025-12-05"},
            {"stage": "Tender Proposal", "status": "completed", "completed_at": "2025-12-28"},
            {"stage": "Tender Approval", "status": "completed", "completed_at": "2026-01-18"},
            {"stage": "Contract / SLA", "status": "completed", "completed_at": "2026-01-25"},
            {"stage": "Development", "status": "completed", "completed_at": "2026-02-01"},
            {"stage": "Maintenance", "status": "in_progress", "completed_at": None}
        ],
        "milestones": [
            {"id": "g-m1", "name": "Cold Milling of Distressed Top Coat", "expected_date": "2026-04-15", "status": "completed", "progress_percent": 100},
            {"id": "g-m2", "name": "Stone Matrix Asphalt (SMA) Layer", "expected_date": "2026-07-31", "status": "completed", "progress_percent": 100},
            {"id": "g-m3", "name": "Thermoplastic Road Marking & Landscaping", "expected_date": "2026-10-31", "status": "in_progress", "progress_percent": 70}
        ],
        "evaluation_config": [],
        "monitoring_rules": [],
        "evidence": [],
        "change_requests": [],
        "comments": []
    },
    {
        "id": "RNB-2026-006",
        "asset_id": "RNB-2026-006",
        "name": "Bharuch Narmada Bypass Bridge Structural Retrofitting",
        "category": "Bridge",
        "work_type": "Maintenance",
        "state": "Gujarat",
        "region": "Surat Region",
        "district": "Bharuch",
        "location": "NH-48 Old Narmada Bridge, Ankleshwar-Bharuch Link",
        "coordinates": {"lat": 21.7051, "lng": 72.9959},
        "responsible_org": "Bharuch National Highway Division R&B",
        "responsible_employee": "Er. T. J. Parmar (Executive Engineer)",
        "superintendent_engineer": "Er. V. P. Mehta (Superintendent Engineer)",
        "contractor": "Afcons Infrastructure Ltd.",
        "estimated_cost_cr": 32.0,
        "current_stage": "Contract / SLA",
        "lifecycle_status": "AWARDED",
        "health_status": "Warning",
        "quality_score": 65,
        "start_date": "2026-09-01",
        "expected_completion": "2027-08-31",
        "description": "Carbon fiber reinforced polymer (CFRP) wrapping on pier columns and replacement of rocker-roller bearings on 1.4 km historic Narmada bridge structure.",
        "priority": "High",
        "status": "Active",
        "progress_percent": 20,
        "public_visible": True,
        "public_condition": "Pre-construction Scaffolding & Site Setup",
        "metrics_current": {
            "Bridge Structural Condition": 65,
            "Bearing Health": 52
        },
        "lifecycle_stages": [
            {"stage": "Proposal", "status": "completed", "completed_at": "2026-02-14"},
            {"stage": "State Approval", "status": "completed", "completed_at": "2026-04-05"},
            {"stage": "Tender Proposal", "status": "completed", "completed_at": "2026-05-18"},
            {"stage": "Tender Approval", "status": "completed", "completed_at": "2026-07-22"},
            {"stage": "Contract / SLA", "status": "completed", "completed_at": "2026-08-25"},
            {"stage": "Development", "status": "upcoming", "completed_at": None},
            {"stage": "Maintenance", "status": "in_progress", "completed_at": None}
        ],
        "milestones": [],
        "evaluation_config": [],
        "monitoring_rules": [],
        "evidence": [],
        "change_requests": [],
        "comments": []
    }
]

SEED_EVALUATIONS = [
    {
        "id": "EVAL-2026-000",
        "project_id": "RNB-2026-001",
        "project_name": "Ahmedabad Ring Road Development Phase 2",
        "district": "Ahmedabad",
        "region": "Ahmedabad Region",
        "milestone_id": "m1",
        "milestone_name": "Foundation & Sub-base Work",
        "evaluator_id": "eval-01",
        "evaluator_name": "Er. Pravin Varma (Quality Auditor)",
        "evaluator_designation": "State Quality Monitor (SQM)",
        "scheduled_date": "2026-04-25",
        "due_date": "2026-04-28",
        "status": "submitted",
        "submitted_at": "2026-04-27T16:20:00Z",
        "is_immutable": True,
        "quality_score": 85,
        "metrics": {
            "Road Quality": 85,
            "Physical Progress": 100,
            "Quality": "Good",
            "Safety": "Compliant",
            "Milestone Completion": "Completed"
        },
        "observations": "Granular sub-base density meets MoRTH specification 401. Compaction tests verified at 98.4% modified Proctor density.",
        "recommendation": "Approved for dense bituminous macadam base layer progression.",
        "evidence_files": [
            {
                "file_name": "proctor_test_morth401.pdf",
                "file_url": "/mock-evidence/proctor_test_morth401.pdf",
                "file_type": "application/pdf"
            }
        ],
        "rules_triggered": [],
        "generated_issue_id": None
    },
    {
        "id": "EVAL-2026-001",
        "project_id": "RNB-2026-001",
        "project_name": "Ahmedabad Ring Road Development Phase 2",
        "district": "Ahmedabad",
        "region": "Ahmedabad Region",
        "milestone_id": "m2",
        "milestone_name": "Structure & Flyover Deck Slab",
        "evaluator_id": "eval-01",
        "evaluator_name": "Er. Pravin Varma (Quality Auditor)",
        "evaluator_designation": "State Quality Monitor (SQM)",
        "scheduled_date": "2026-09-25",
        "due_date": "2026-09-30",
        "status": "submitted",
        "submitted_at": "2026-09-25T09:28:00Z",
        "is_immutable": True,
        "quality_score": 48,
        "metrics": {
            "Road Quality": 48,
            "Pothole Density": 18,
            "Physical Progress": 62,
            "Quality": "Poor",
            "Safety": "Compliant",
            "Milestone Completion": "Not Completed"
        },
        "observations": "Pier P-14 and P-15 deck slab casting remains delayed by 18 days. Severe honeycomb voiding detected on pier 15 soffit, and riding surface deteriorated with pothole density of 18/km.",
        "recommendation": "Issue immediate stop-work notice on deck slab until pressure grouting and quality audit certification are complete.",
        "evidence_files": [
            {
                "file_name": "deck_slab_void_defect.jpg",
                "file_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg"
            }
        ],
        "rules_triggered": ["RULE-RQ-60", "RULE-PD-15", "rule-1", "rule-2"],
        "generated_issue_id": "ISSUE-1024"
    },
    {
        "id": "EVAL-2026-002",
        "project_id": "RNB-2026-002",
        "project_name": "Surat Cable Bridge & Riverfront Approach Rehabilitation",
        "district": "Surat",
        "region": "Surat Region",
        "milestone_id": "surat-m2",
        "milestone_name": "Expansion Joint 4 Elastomeric Seal Replacement",
        "evaluator_id": "eval-02",
        "evaluator_name": "Er. Jagdish Mehta (NDT Specialist)",
        "evaluator_designation": "Independent Bridge Auditor",
        "scheduled_date": "2026-09-27",
        "due_date": "2026-10-05",
        "status": "submitted",
        "submitted_at": "2026-09-27T08:40:00Z",
        "is_immutable": True,
        "quality_score": 42,
        "metrics": {
            "Expansion Joint Condition": 42,
            "Drainage & Joint Seal": "Poor",
            "Public Safety": "Caution"
        },
        "observations": "Elastomeric neoprene seal cracked along Pier 4 expansion joint. Water ponding observed on bridge deck after unseasonal precipitation.",
        "recommendation": "Mobilize night lane closure and replace joint seal strip immediately to prevent chloride penetration.",
        "evidence_files": [
            {
                "file_name": "surat_bridge_joint4.jpg",
                "file_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg"
            }
        ],
        "rules_triggered": ["RULE-EJ-50", "rule-surat-2"],
        "generated_issue_id": "ISSUE-1025"
    }
]

SEED_ISSUES = [
    {
        "id": "ISSUE-1024",
        "project_id": "RNB-2026-001",
        "project_name": "Ahmedabad Ring Road Development Phase 2",
        "district": "Ahmedabad",
        "region": "Ahmedabad Region",
        "evaluation_id": "EVAL-2026-001",
        "title": "Road Quality Deterioration & Milestone Structure Delay",
        "detected_metric": "Road Quality",
        "detected_value": "48",
        "threshold_value": "60",
        "operator": "<",
        "rule_id": "RULE-RQ-60",
        "detection_reason": "Road Quality fell to 48, breaching configured threshold of 60. Field inspection also confirmed honeycombing and rebar delay.",
        "parameter": "Road Quality",
        "observed_value": "48 (Threshold: 60)",
        "severity": "Critical",
        "detected_date": "2026-09-25",
        "created_at": "2026-09-25T09:30:00Z",
        "aging_days": 3,
        "responsible_org": "Roads & Buildings Circle Ahmedabad",
        "responsible_employee": "Er. R. K. Patel (Executive Engineer)",
        "assigned_to": "ABC Infrastructure Ltd. Remediation Wing",
        "status": "ACKNOWLEDGED",
        "maintenance_id": "MAINT-2026-001",
        "resolution_notes": "District Executive Engineer formally acknowledged critical defect notice. Issued 24-hr cause memo to contractor ABC Infrastructure. Remediation crew deployed on site.",
        "evidence": [
            {
                "file_name": "deck_slab_void_defect.jpg",
                "file_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg",
                "uploaded_by": "Er. Pravin Varma (SQM)",
                "uploaded_at": "2026-09-25T09:35:00Z",
                "caption": "Rebar spacing irregularity and honeycomb void on Pier 15"
            }
        ],
        "operational_timeline": [
            {
                "event_id": "EVT-1024-1",
                "stage": "Detected",
                "timestamp": "2026-09-25T09:30:00Z",
                "actor": "System (Automated Rule Engine)",
                "status": "completed",
                "details": "Evaluation EVAL-2026-001 observed Road Quality = 48 breaching threshold < 60 (Rule #RULE-RQ-60). Issue automatically created.",
                "metadata": {"detected_metric": "Road Quality", "detected_value": 48, "threshold": 60, "rule_id": "RULE-RQ-60"}
            },
            {
                "event_id": "EVT-1024-2",
                "stage": "Acknowledged",
                "timestamp": "2026-09-25T11:00:00Z",
                "actor": "Er. R. K. Patel (EE Ahmedabad)",
                "status": "completed",
                "details": "District Executive Engineer formally acknowledged critical defect notice. Issued 24-hr memo to contractor ABC Infrastructure.",
                "metadata": {"acknowledged_by": "Er. R. K. Patel"}
            },
            {
                "event_id": "EVT-1024-3",
                "stage": "Assigned",
                "timestamp": "2026-09-26T10:00:00Z",
                "actor": "Er. R. K. Patel (EE Ahmedabad)",
                "status": "completed",
                "details": "Corrective maintenance assigned to ABC Infrastructure Maintenance Wing under supervision of Er. A. Desai.",
                "metadata": {"maintenance_id": "MAINT-2026-001"}
            },
            {
                "event_id": "EVT-1024-4",
                "stage": "In Progress",
                "timestamp": "2026-09-27T08:00:00Z",
                "actor": "ABC Infrastructure Remediation Crew",
                "status": "in_progress",
                "details": "Emergency micro-concrete pressure grouting and hydraulic slab re-alignment active on site.",
                "metadata": {"scheduled_completion": "2026-09-30"}
            },
            {
                "event_id": "EVT-1024-5",
                "stage": "Pending Verification",
                "timestamp": None,
                "actor": "State Quality Monitor (SQM)",
                "status": "upcoming",
                "details": "SQM re-inspection to verify compression strength and ultrasonic pulse velocity.",
                "metadata": {}
            },
            {
                "event_id": "EVT-1024-6",
                "stage": "Resolved",
                "timestamp": None,
                "actor": "Superintendent Engineer Ahmedabad",
                "status": "upcoming",
                "details": "Verification confirmation and operational clearance.",
                "metadata": {}
            },
            {
                "event_id": "EVT-1024-7",
                "stage": "Closed",
                "timestamp": None,
                "actor": "District Authority",
                "status": "upcoming",
                "details": "Final closure and audit archiving.",
                "metadata": {}
            }
        ]
    },
    {
        "id": "ISSUE-1025",
        "project_id": "RNB-2026-002",
        "project_name": "Surat Cable Bridge & Riverfront Approach Rehabilitation",
        "district": "Surat",
        "region": "Surat Region",
        "evaluation_id": "EVAL-2026-002",
        "title": "Expansion Joint 4 Elastomeric Seal Degradation",
        "detected_metric": "Expansion Joint Condition",
        "detected_value": "42",
        "threshold_value": "50",
        "operator": "<",
        "rule_id": "RULE-EJ-50",
        "detection_reason": "Expansion Joint Condition (42) fell below water-tightness threshold of 50. Water ponding detected.",
        "parameter": "Expansion Joint Condition",
        "observed_value": "42 (Threshold: 50)",
        "severity": "Warning",
        "detected_date": "2026-09-27",
        "created_at": "2026-09-27T08:45:00Z",
        "aging_days": 1,
        "responsible_org": "Surat City R&B Division",
        "responsible_employee": "Er. M. S. Vora (Executive Engineer)",
        "assigned_to": "L&T Bridge Maintenance Cell",
        "status": "IN_PROGRESS",
        "maintenance_id": "MAINT-2026-002",
        "resolution_notes": "Replacement neoprene seal strip cleared from customs; night lane closure requisitioned.",
        "evidence": [
            {
                "file_name": "surat_bridge_joint4.jpg",
                "file_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg",
                "uploaded_by": "Er. Jagdish Mehta (NDT Specialist)",
                "uploaded_at": "2026-09-27T08:40:00Z",
                "caption": "Pier 4 elastomeric seal split"
            }
        ],
        "operational_timeline": [
            {
                "event_id": "EVT-1025-1",
                "stage": "Detected",
                "timestamp": "2026-09-27T08:45:00Z",
                "actor": "System (Automated Rule Engine)",
                "status": "completed",
                "details": "Inspection EVAL-2026-002 observed Expansion Joint Condition = 42 (< 50). Rule #RULE-EJ-50 triggered.",
                "metadata": {"rule_id": "RULE-EJ-50"}
            },
            {
                "event_id": "EVT-1025-2",
                "stage": "Acknowledged",
                "timestamp": "2026-09-27T09:30:00Z",
                "actor": "Er. M. S. Vora (EE Surat)",
                "status": "completed",
                "details": "Acknowledged. Dispatched bridge maintenance inspector.",
                "metadata": {}
            },
            {
                "event_id": "EVT-1025-3",
                "stage": "Assigned",
                "timestamp": "2026-09-27T10:15:00Z",
                "actor": "Er. M. S. Vora (EE Surat)",
                "status": "completed",
                "details": "Assigned to L&T Bridge Maintenance Cell with urgent night requisition.",
                "metadata": {"maintenance_id": "MAINT-2026-002"}
            },
            {
                "event_id": "EVT-1025-4",
                "stage": "In Progress",
                "timestamp": "2026-09-28T08:00:00Z",
                "actor": "L&T Specialized Crew",
                "status": "in_progress",
                "details": "Night-time sealing compound mobilization and temporary traffic diversion barricading active.",
                "metadata": {}
            },
            {
                "event_id": "EVT-1025-5",
                "stage": "Pending Verification",
                "timestamp": None,
                "actor": "Independent Bridge Auditor",
                "status": "upcoming",
                "details": "Hydrostatic ponding test verification.",
                "metadata": {}
            },
            {
                "event_id": "EVT-1025-6",
                "stage": "Resolved",
                "timestamp": None,
                "actor": "Surat Circle Authority",
                "status": "upcoming",
                "details": "Certificate of compliance.",
                "metadata": {}
            },
            {
                "event_id": "EVT-1025-7",
                "stage": "Closed",
                "timestamp": None,
                "actor": "Surat District Authority",
                "status": "upcoming",
                "details": "Final administrative closure.",
                "metadata": {}
            }
        ]
    }
]

SEED_MAINTENANCE = [
    {
        "id": "MAINT-2026-001",
        "issue_id": "ISSUE-1024",
        "infrastructure_id": "RNB-2026-001",
        "infrastructure_name": "Ahmedabad Ring Road Development Phase 2",
        "district": "Ahmedabad",
        "region": "Ahmedabad Region",
        "assigned_party": "ABC Infrastructure Ltd. Maintenance Wing",
        "priority": "High",
        "scheduled_date": "2026-09-27",
        "start_date": "2026-09-27",
        "completion_date": None,
        "description": "Micro-silica pressure grouting of Pier 15 deck honeycomb voids, hydraulic deck leveling, and asphalt patchwork.",
        "cost_estimate_cr": 0.85,
        "status": "IN_PROGRESS",
        "verification_requested": False,
        "verifier_name": "Er. Pravin Varma (SQM)",
        "verification_notes": None,
        "evidence": [
            {
                "file_name": "grouting_pump_site.jpg",
                "file_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop",
                "file_type": "image/jpeg",
                "uploaded_by": "ABC Site Engineer",
                "uploaded_at": "2026-09-27T09:00:00Z",
                "caption": "Pressure grouting pump mobilized at Pier 15"
            }
        ],
        "created_at": "2026-09-26T10:00:00Z"
    },
    {
        "id": "MAINT-2026-002",
        "issue_id": "ISSUE-1025",
        "infrastructure_id": "RNB-2026-002",
        "infrastructure_name": "Surat Cable Bridge & Riverfront Approach Rehabilitation",
        "district": "Surat",
        "region": "Surat Region",
        "assigned_party": "L&T Bridge Maintenance Cell",
        "priority": "Medium",
        "scheduled_date": "2026-09-28",
        "start_date": "2026-09-28",
        "completion_date": None,
        "description": "Night-shift lane closure for Pier 4 expansion joint neoprene rubber extrusion profile replacement.",
        "cost_estimate_cr": 0.45,
        "status": "IN_PROGRESS",
        "verification_requested": False,
        "verifier_name": "Er. Jagdish Mehta (NDT Auditor)",
        "verification_notes": None,
        "evidence": [],
        "created_at": "2026-09-27T10:15:00Z"
    }
]

SEED_TENDERS = [
    {
        "id": "TND-2026-042",
        "project_id": "RNB-2026-001",
        "project_name": "Ahmedabad Ring Road Development Phase 2",
        "tender_title": "Construction of 6-Lane Ring Road Arterial Corridor with 2 Grade Separator Flyovers",
        "district": "Ahmedabad",
        "region": "Ahmedabad Region",
        "category": "Roads & Bridges",
        "estimated_value_cr": 120.0,
        "earnest_money_deposit_cr": 1.20,
        "tender_fee_inr": 25000,
        "contract_period_months": 24,
        "status": "AWARDED",
        "lifecycle_status": "AWARDED",
        "publish_date": "2025-10-14",
        "bid_closing_date": "2025-11-20",
        "technical_bid_opening": "2025-11-25",
        "awarded_vendor": "ABC Infrastructure Ltd.",
        "awarded_value_cr": 118.4,
        "awarded_date": "2025-12-20",
        "eligibility_criteria": "Class-AA registered Government Highway Contractor with average annual turnover >= ₹90 Cr over last 3 fiscal years. Must have completed at least one 4-lane or 6-lane elevated corridor work exceeding ₹60 Cr.",
        "scope_of_work": "Rigid pavement, granular sub-base, flyover deck slab, precast girder installation, LED high-mast illumination, stormwater drains, and road safety furniture.",
        "documents": [
            {"name": "NIT_Notice_042.pdf", "size": "1.8 MB", "category": "Notice Inviting Tender"},
            {"name": "Technical_Specifications_Vol_I.pdf", "size": "8.4 MB", "category": "Specifications"},
            {"name": "Schedule_B_BOQ.xlsx", "size": "420 KB", "category": "Bill of Quantities"}
        ]
    },
    {
        "id": "TND-2026-088",
        "project_id": "RNB-2026-002",
        "project_name": "Surat Cable Bridge & Riverfront Approach Rehabilitation",
        "tender_title": "Specialized Structural Health Monitoring, Cable Stay Damping & Modular Joint Overhaul",
        "district": "Surat",
        "region": "Surat Region",
        "category": "Bridge Maintenance",
        "estimated_value_cr": 48.5,
        "earnest_money_deposit_cr": 0.485,
        "tender_fee_inr": 15000,
        "contract_period_months": 24,
        "status": "AWARDED",
        "lifecycle_status": "AWARDED",
        "publish_date": "2025-03-25",
        "bid_closing_date": "2025-04-30",
        "technical_bid_opening": "2025-05-05",
        "awarded_vendor": "L&T Heavy Civil Infrastructure",
        "awarded_value_cr": 47.9,
        "awarded_date": "2025-05-12",
        "eligibility_criteria": "Specialized international/national bridge engineering consortium with demonstrated experience in cable-stayed or suspension bridge health telemetry.",
        "scope_of_work": "Non-destructive testing, acoustic stay-cable vibration telemetry, expansion joint elastomeric seal renewal, and anti-carbonation pylon coating.",
        "documents": [
            {"name": "NIT_Surat_Bridge_088.pdf", "size": "2.2 MB", "category": "Notice Inviting Tender"},
            {"name": "NDT_Testing_Protocols.pdf", "size": "5.1 MB", "category": "Testing Guidelines"}
        ]
    },
    {
        "id": "TND-2026-104",
        "project_id": "RNB-2026-004",
        "project_name": "Rajkot-Morbi 4-Lane Industrial Highway Modernization",
        "tender_title": "Widening & Reconstruction to 4-Lane Rigid Concrete Pavement with Heavy Freight Corridors (64 Km)",
        "district": "Rajkot",
        "region": "Rajkot Region",
        "category": "Highway Development",
        "estimated_value_cr": 210.0,
        "earnest_money_deposit_cr": 2.10,
        "tender_fee_inr": 50000,
        "contract_period_months": 36,
        "status": "OPEN",
        "lifecycle_status": "OPEN",
        "publish_date": "2026-09-10",
        "bid_closing_date": "2026-10-31",
        "technical_bid_opening": "2026-11-05",
        "awarded_vendor": None,
        "awarded_value_cr": None,
        "awarded_date": None,
        "eligibility_criteria": "Class-AA Contractor with minimum 10 years experience in rigid concrete pavement (PQC). Net worth must exceed ₹75 Cr. Joint ventures permitted up to 2 partners.",
        "scope_of_work": "Full depth concrete pavement, toll plaza automation, weigh-in-motion sensors, and grade-separated bypasses for 4 village junctions.",
        "documents": [
            {"name": "RFP_Rajkot_Morbi_Highway_104.pdf", "size": "4.5 MB", "category": "Request for Proposal"},
            {"name": "Geotechnical_Soil_Investigation.pdf", "size": "12.8 MB", "category": "Technical Data"}
        ]
    },
    {
        "id": "TND-2026-112",
        "project_id": "RNB-2026-006",
        "project_name": "Bharuch Narmada Bypass Bridge Structural Retrofitting",
        "tender_title": "Seismic Retrofitting, CFRP Column Wrapping & Elastomeric Bearing Replacement",
        "district": "Bharuch",
        "region": "Surat Region",
        "category": "Bridge Rehabilitation",
        "estimated_value_cr": 32.0,
        "earnest_money_deposit_cr": 0.32,
        "tender_fee_inr": 10000,
        "contract_period_months": 18,
        "status": "UNDER_EVALUATION",
        "lifecycle_status": "UNDER_EVALUATION",
        "publish_date": "2026-05-18",
        "bid_closing_date": "2026-07-10",
        "technical_bid_opening": "2026-07-22",
        "awarded_vendor": "Afcons Infrastructure Ltd. (L1 Bidder)",
        "awarded_value_cr": 31.4,
        "awarded_date": "Pending Sanction",
        "eligibility_criteria": "Proven track record in underwater pier retrofitting, epoxy injection, and bearing jacking works.",
        "scope_of_work": "Hydraulic jacking of 24 spans to replace degraded steel rocker bearings with elastomeric neoprene pads, plus CFRP confinement.",
        "documents": [
            {"name": "Tender_Document_Bharuch_Bridge.pdf", "size": "3.1 MB", "category": "Notice Inviting Tender"}
        ]
    }
]

SEED_PROPOSALS = [
    {
        "id": "PROP-2026-001",
        "tender_id": "TND-2026-104",
        "company_name": "Gujarat Megastructure Builders LLP",
        "contact_email": "bids@megastructure-guj.com",
        "contact_phone": "+91 98250 11223",
        "proposed_amount_cr": 204.5,
        "proposal_summary": "Comprehensive turnkey proposal for 64km 4-lane rigid concrete pavement using dual-slipform Wirtgen pavers with 5-year defect liability warranty.",
        "submission_date": "2026-09-20",
        "status": "UNDER_REVIEW",
        "documents": [
            {"name": "Technical_Proposal_Megastructure.pdf", "size": "3.8 MB"},
            {"name": "Financial_Bid_Schedule.pdf", "size": "1.2 MB"}
        ]
    },
    {
        "id": "PROP-2026-002",
        "tender_id": "TND-2026-104",
        "company_name": "Patel Highway Infra Concessions",
        "contact_email": "tenders@patelinfra.in",
        "contact_phone": "+91 98795 44332",
        "proposed_amount_cr": 208.2,
        "proposal_summary": "Turnkey highway construction proposal with automated high-capacity batching plant stationed in Morbi and dedicated 24-hr traffic diversion corridor.",
        "submission_date": "2026-09-24",
        "status": "UNDER_REVIEW",
        "documents": [
            {"name": "Patel_Infra_Technical_Bid.pdf", "size": "5.1 MB"}
        ]
    }
]

SEED_NOTIFICATIONS = [
    {
        "id": "NOTIF-001",
        "recipient_role": "District-1",
        "district": "Ahmedabad",
        "type": "CRITICAL_ISSUE",
        "title": "Critical Infrastructure Deterioration Detected",
        "message": "Ahmedabad Ring Road: Road Quality fell to 48 (Threshold: 60). Immediate action required.",
        "entity_type": "issue",
        "entity_id": "ISSUE-1024",
        "is_read": False,
        "created_at": "2026-09-25T09:30:00Z"
    },
    {
        "id": "NOTIF-002",
        "recipient_role": "State",
        "district": None,
        "type": "OVERDUE_MAINTENANCE",
        "title": "District-1 Critical Issue Aging (3 Days)",
        "message": "Ahmedabad Ring Road ISSUE-1024 has remained active for 3 days. Oversight review recommended.",
        "entity_type": "issue",
        "entity_id": "ISSUE-1024",
        "is_read": False,
        "created_at": "2026-09-27T10:00:00Z"
    },
    {
        "id": "NOTIF-003",
        "recipient_role": "Evaluator",
        "district": "Ahmedabad",
        "type": "VERIFICATION_REQUIRED",
        "title": "Maintenance Verification Pending",
        "message": "Maintenance MAINT-2026-001 scheduled for verification upon completion.",
        "entity_type": "maintenance",
        "entity_id": "MAINT-2026-001",
        "is_read": False,
        "created_at": "2026-09-28T08:00:00Z"
    },
    {
        "id": "NOTIF-004",
        "recipient_role": "Vendor",
        "district": "Rajkot",
        "type": "TENDER_DEADLINE",
        "title": "Rajkot-Morbi Highway Tender Open for Bids",
        "message": "Bid submission for TND-2026-104 is open until 31 Oct 2026 (Value: ₹210 Cr).",
        "entity_type": "tender",
        "entity_id": "TND-2026-104",
        "is_read": False,
        "created_at": "2026-09-26T00:00:00Z"
    }
]

SEED_AUDIT_LOGS = [
    {
        "id": "AUD-001",
        "actor": "System Automated Rule Engine",
        "role": "System",
        "action": "EXCEPTION_DETECTED",
        "entity_type": "project",
        "entity_id": "RNB-2026-001",
        "details": "Evaluation EVAL-2026-001 reported Road Quality = 48, breaching Rule #RULE-RQ-60 (< 60). Auto-generated ISSUE-1024.",
        "old_value": "Healthy (Score: 85)",
        "new_value": "Critical (Score: 48)",
        "timestamp": "2026-09-25T09:30:00Z"
    },
    {
        "id": "AUD-002",
        "actor": "Er. R. K. Patel (Executive Engineer)",
        "role": "District-1",
        "action": "ISSUE_ACKNOWLEDGED",
        "entity_type": "issue",
        "entity_id": "ISSUE-1024",
        "details": "District Executive Engineer formally acknowledged critical defect notice.",
        "old_value": "DETECTED",
        "new_value": "ACKNOWLEDGED",
        "timestamp": "2026-09-25T11:00:00Z"
    },
    {
        "id": "AUD-003",
        "actor": "Er. R. K. Patel (Executive Engineer)",
        "role": "District-1",
        "action": "MAINTENANCE_CREATED",
        "entity_type": "maintenance",
        "entity_id": "MAINT-2026-001",
        "details": "Scheduled corrective maintenance with ABC Infrastructure Ltd. Maintenance Wing.",
        "old_value": None,
        "new_value": "MAINT-2026-001 (IN_PROGRESS)",
        "timestamp": "2026-09-26T10:00:00Z"
    }
]


def seed_database(force: bool = False) -> Dict[str, Any]:
    """Seed MongoDB with realistic Gujarat R&B demo dataset."""
    try:
        db = get_mongo_db()

        # Check if already seeded and not forcing
        existing_projects = db.projects.count_documents({})
        if existing_projects > 0 and not force:
            return {
                "success": True,
                "message": f"Database already seeded ({existing_projects} projects). Use force=True to reseed.",
                "counts": {
                    "projects": db.projects.count_documents({}),
                    "evaluations": db.evaluations.count_documents({}),
                    "issues": db.issues.count_documents({}),
                    "maintenance": db.maintenance.count_documents({}),
                    "tenders": db.tenders.count_documents({}),
                    "proposals": db.proposals.count_documents({}),
                    "notifications": db.notifications.count_documents({}),
                    "audit_logs": db.audit_logs.count_documents({})
                }
            }

        # Clear existing collections if forcing or initial empty
        db.regions_districts.delete_many({})
        db.projects.delete_many({})
        db.evaluations.delete_many({})
        db.issues.delete_many({})
        db.maintenance.delete_many({})
        db.tenders.delete_many({})
        db.proposals.delete_many({})
        db.notifications.delete_many({})
        db.audit_logs.delete_many({})

        # Insert seed data
        db.regions_districts.insert_many([dict(item) for item in SEED_REGIONS])
        db.projects.insert_many([dict(item) for item in SEED_PROJECTS])
        db.evaluations.insert_many([dict(item) for item in SEED_EVALUATIONS])
        db.issues.insert_many([dict(item) for item in SEED_ISSUES])
        db.maintenance.insert_many([dict(item) for item in SEED_MAINTENANCE])
        db.tenders.insert_many([dict(item) for item in SEED_TENDERS])
        db.proposals.insert_many([dict(item) for item in SEED_PROPOSALS])
        db.notifications.insert_many([dict(item) for item in SEED_NOTIFICATIONS])
        db.audit_logs.insert_many([dict(item) for item in SEED_AUDIT_LOGS])

        # Create indexes for high-performance querying
        db.projects.create_index("id", unique=True)
        db.projects.create_index("district")
        db.projects.create_index("region")
        db.projects.create_index("category")
        db.projects.create_index("lifecycle_status")
        db.projects.create_index("health_status")
        
        db.evaluations.create_index("id", unique=True)
        db.evaluations.create_index("project_id")
        db.evaluations.create_index("evaluator_id")
        
        db.issues.create_index("id", unique=True)
        db.issues.create_index("project_id")
        db.issues.create_index("district")
        db.issues.create_index("status")
        db.issues.create_index("severity")
        db.issues.create_index("created_at")

        db.maintenance.create_index("id", unique=True)
        db.maintenance.create_index("issue_id")
        db.maintenance.create_index("infrastructure_id")
        db.maintenance.create_index("district")
        db.maintenance.create_index("status")

        db.tenders.create_index("id", unique=True)
        db.tenders.create_index("status")
        db.tenders.create_index("district")

        db.proposals.create_index("id", unique=True)
        db.proposals.create_index("tender_id")
        db.proposals.create_index("company_name")

        db.notifications.create_index("id", unique=True)
        db.notifications.create_index("recipient_role")
        db.notifications.create_index("district")
        db.notifications.create_index("is_read")

        db.audit_logs.create_index("id", unique=True)
        db.audit_logs.create_index("entity_id")
        db.audit_logs.create_index("timestamp")

        return {
            "success": True,
            "message": "PRAVI MongoDB seeded successfully with Gujarat R&B P1 dataset.",
            "counts": {
                "projects": len(SEED_PROJECTS),
                "evaluations": len(SEED_EVALUATIONS),
                "issues": len(SEED_ISSUES),
                "maintenance": len(SEED_MAINTENANCE),
                "tenders": len(SEED_TENDERS),
                "proposals": len(SEED_PROPOSALS),
                "notifications": len(SEED_NOTIFICATIONS),
                "audit_logs": len(SEED_AUDIT_LOGS)
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def init_mongodb() -> Dict[str, Any]:
    """Ensure MongoDB connection and seed initial data if empty."""
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        # Check and seed if empty
        res = seed_database(force=False)
        return {"success": True, "message": f"MongoDB '{MONGO_DATABASE}' connected. {res.get('message')}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
