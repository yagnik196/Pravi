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
        "start_date": "2026-01-15",
        "expected_completion": "2026-11-30",
        "description": "Six-lane arterial ring road corridor connecting SP Ring Road to SG Highway with dedicated service roads, grade separator flyover, and integrated storm drainage.",
        "priority": "High",
        "status": "Delayed",
        "progress_percent": 62,
        "public_visible": True,
        "public_condition": "Under Construction - Pier Slab Stage",
        "lifecycle_stages": [
            {
                "stage": "Proposal",
                "status": "completed",
                "completed_at": "2025-08-10",
                "note": "Initial DPR submitted by Executive Engineer, Ahmedabad Circle"
            },
            {
                "stage": "State Approval",
                "status": "completed",
                "completed_at": "2025-09-02",
                "note": "Administrative Approval #RND-GUJ-8812 sanctioned by Secretary, R&B Gandhinagar"
            },
            {
                "stage": "Tender Proposal",
                "status": "completed",
                "completed_at": "2025-10-14",
                "note": "Notice Inviting Tender published on Gujarat e-Procurement Portal"
            },
            {
                "stage": "Tender Approval",
                "status": "completed",
                "completed_at": "2025-12-20",
                "note": "Technical & Financial bid sanctioned; awarded to ABC Infrastructure Ltd."
            },
            {
                "stage": "Contract / SLA",
                "status": "completed",
                "completed_at": "2026-01-10",
                "note": "Tripartite contract signed with 4 milestone performance SLAs and defect liability commitments"
            },
            {
                "stage": "Development",
                "status": "in_progress",
                "completed_at": None,
                "note": "Active civil works in progress (62% physical completion; structural delay detected)"
            },
            {
                "stage": "Maintenance",
                "status": "upcoming",
                "completed_at": None,
                "note": "5-year Defect Liability & Comprehensive Road Asset Maintenance"
            }
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
            {
                "parameter": "Physical Progress",
                "unit": "%",
                "monitoring_type": "Progress",
                "target_description": "Expected >= 70% for current milestone schedule"
            },
            {
                "parameter": "Quality",
                "unit": "Grade",
                "monitoring_type": "Quality",
                "options": ["Excellent", "Good", "Satisfactory", "Poor"],
                "target_description": "M40 concrete cube test compressive strength >= 40 MPa"
            },
            {
                "parameter": "Safety",
                "unit": "Status",
                "monitoring_type": "Safety",
                "options": ["Compliant", "Minor Hazard", "Critical Hazard"],
                "target_description": "Zero non-compliance on traffic diversion barricades and PPE"
            },
            {
                "parameter": "Milestone Completion",
                "unit": "Status",
                "monitoring_type": "Schedule",
                "options": ["Completed", "On Schedule", "Not Completed"],
                "target_description": "Deliverable handed over within SLA timeframe"
            }
        ],
        "monitoring_rules": [
            {
                "id": "rule-1",
                "parameter": "Milestone Completion",
                "operator": "equals",
                "threshold_value": "Not Completed",
                "action": "create_issue",
                "issue_title": "Development milestone #2 structure not completed",
                "severity": "Critical"
            },
            {
                "id": "rule-2",
                "parameter": "Quality",
                "operator": "equals",
                "threshold_value": "Poor",
                "action": "create_issue",
                "issue_title": "Construction quality rated Poor by field auditor",
                "severity": "Critical"
            },
            {
                "id": "rule-3",
                "parameter": "Safety",
                "operator": "equals",
                "threshold_value": "Critical Hazard",
                "action": "create_issue",
                "issue_title": "Severe site safety violation reported",
                "severity": "Critical"
            },
            {
                "id": "rule-4",
                "parameter": "Physical Progress",
                "operator": "less_than",
                "threshold_value": 70,
                "action": "create_issue",
                "issue_title": "Physical progress lag detected below SLA threshold (70%)",
                "severity": "Warning"
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
                "message": "Notice issued to ABC Infrastructure. Additional hydraulic piling rig will be mobilized by 30th Sep."
            }
        ]
    },
    {
        "id": "RNB-2026-002",
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
        "start_date": "2025-06-01",
        "expected_completion": "2027-05-31",
        "description": "Continuous structural health monitoring, stay-cable tension damping inspection, elastomeric bearing replacement, and deck re-surfacing on Tapi River Cable Stayed Bridge.",
        "priority": "High",
        "status": "Active",
        "progress_percent": 45,
        "public_visible": True,
        "public_condition": "Operational - Scheduled Maintenance Active",
        "lifecycle_stages": [
            {
                "stage": "Proposal",
                "status": "completed",
                "completed_at": "2025-01-10",
                "note": "Surat bridge condition assessment proposed periodic rehabilitation"
            },
            {
                "stage": "State Approval",
                "status": "completed",
                "completed_at": "2025-02-18",
                "note": "Approved under Gujarat State Urban Infrastructure Maintenance Scheme"
            },
            {
                "stage": "Tender Proposal",
                "status": "completed",
                "completed_at": "2025-03-25",
                "note": "Specialized cable-stayed bridge maintenance tender floated"
            },
            {
                "stage": "Tender Approval",
                "status": "completed",
                "completed_at": "2025-05-12",
                "note": "Awarded to L&T Heavy Civil Infrastructure"
            },
            {
                "stage": "Contract / SLA",
                "status": "completed",
                "completed_at": "2025-05-28",
                "note": "24-month maintenance contract with continuous strain-sensor telemetry SLA"
            },
            {
                "stage": "Development",
                "status": "completed",
                "completed_at": "2025-06-01",
                "note": "Transitioned directly to active maintenance regimen"
            },
            {
                "stage": "Maintenance",
                "status": "in_progress",
                "completed_at": None,
                "note": "Ongoing quarterly vibration, joint and corrosion inspection cycles"
            }
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
            {
                "parameter": "Structural Condition",
                "unit": "Status",
                "monitoring_type": "Condition",
                "options": ["Sound", "Minor Wear", "Critical Defect"],
                "target_description": "Stay cable tension deviation within ±3%"
            },
            {
                "parameter": "Drainage & Joint Seal",
                "unit": "Status",
                "monitoring_type": "Quality",
                "options": ["Good", "Satisfactory", "Poor"],
                "target_description": "Water-tight expansion seal without debris clogging"
            },
            {
                "parameter": "Public Safety",
                "unit": "Status",
                "monitoring_type": "Safety",
                "options": ["Safe", "Caution", "Hazard"],
                "target_description": "Anti-skid wearing coat intact on vehicle lanes"
            }
        ],
        "monitoring_rules": [
            {
                "id": "rule-surat-1",
                "parameter": "Structural Condition",
                "operator": "equals",
                "threshold_value": "Critical Defect",
                "action": "create_issue",
                "issue_title": "Critical structural defect detected on stay cable anchor",
                "severity": "Critical"
            },
            {
                "id": "rule-surat-2",
                "parameter": "Drainage & Joint Seal",
                "operator": "equals",
                "threshold_value": "Poor",
                "action": "create_issue",
                "issue_title": "Expansion joint seal degradation causing water ponding",
                "severity": "Warning"
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
        "start_date": "2025-11-15",
        "expected_completion": "2027-02-28",
        "description": "G+8 multi-department institutional complex with green building GRIHA 4-star compliance, solar rooftop, and automated subterranean parking.",
        "priority": "Medium",
        "status": "Active",
        "progress_percent": 38,
        "public_visible": True,
        "public_condition": "Civil Superstructure Framing (4th Floor)",
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
            {"id": "rule-v-1", "parameter": "Structural Concrete Quality", "operator": "equals", "threshold_value": "Poor", "action": "create_issue", "issue_title": "Cube test failure on column batch", "severity": "Critical"}
        ],
        "change_requests": [],
        "comments": []
    },
    {
        "id": "RNB-2026-004",
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
        "start_date": "2026-12-01",
        "expected_completion": "2028-11-30",
        "description": "Widening 64 km heavy industrial highway into 4 lanes with rigid concrete pavement suited for 50-tonne ceramic transport vehicles.",
        "priority": "High",
        "status": "Active",
        "progress_percent": 5,
        "public_visible": True,
        "public_condition": "Under State Administrative Review",
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
        "change_requests": [],
        "comments": []
    },
    {
        "id": "RNB-2026-005",
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
        "start_date": "2026-02-01",
        "expected_completion": "2026-10-31",
        "description": "Ultra-thin white topping and asphalt milling resurfacing along state capital ceremonial corridors.",
        "priority": "Medium",
        "status": "Active",
        "progress_percent": 82,
        "public_visible": True,
        "public_condition": "Near Completion - Wearing Course Finished",
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
        "change_requests": [],
        "comments": []
    },
    {
        "id": "RNB-2026-006",
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
        "start_date": "2026-09-01",
        "expected_completion": "2027-08-31",
        "description": "Carbon fiber reinforced polymer (CFRP) wrapping on pier columns and replacement of rocker-roller bearings on 1.4 km historic Narmada bridge structure.",
        "priority": "High",
        "status": "Active",
        "progress_percent": 20,
        "public_visible": True,
        "public_condition": "Pre-construction Scaffolding & Site Setup",
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
        "metrics": {
            "Physical Progress": 100,
            "Quality": "Good",
            "Safety": "Compliant",
            "Milestone Completion": "Completed"
        },
        "observations": "Granular sub-base density meets MoRTH specification 401. Compaction tests verified at 98.4% modified Proctor density.",
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
        "scheduled_date": "2026-09-26",
        "due_date": "2026-09-30",
        "status": "assigned",
        "submitted_at": None,
        "is_immutable": False,
        "metrics": {
            "Physical Progress": 62,
            "Quality": "Good",
            "Safety": "Compliant",
            "Milestone Completion": "Not Completed"
        },
        "observations": "Pier P-14 and P-15 deck slab casting remains incomplete. Rebar tying delayed by 18 days due to heavy monsoon runoff and steel batch supply shortfall.",
        "rules_triggered": [],
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
        "scheduled_date": "2026-09-28",
        "due_date": "2026-10-05",
        "status": "assigned",
        "submitted_at": None,
        "is_immutable": False,
        "metrics": {
            "Structural Condition": "Minor Wear",
            "Drainage & Joint Seal": "Poor",
            "Public Safety": "Caution"
        },
        "observations": "Elastomeric rubber seal cracked along Pier 4 expansion joint. Water ponding observed on bridge deck after unseasonal precipitation.",
        "rules_triggered": [],
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
        "title": "Development milestone #2 structure not completed",
        "parameter": "Milestone Completion",
        "observed_value": "Not Completed",
        "severity": "Critical",
        "detected_date": "2026-09-28",
        "responsible_org": "Roads & Buildings Circle Ahmedabad",
        "responsible_employee": "Er. R. K. Patel (Executive Engineer)",
        "status": "UNDER REVIEW",
        "resolution_notes": "Contractor issued show-cause notice. Deployment of 2nd hydraulic crane and dual-shift rebar tying scheduled to recover 14 days delay.",
        "operational_timeline": [
            {
                "stage": "Detected",
                "timestamp": "2026-09-28T09:30:00Z",
                "actor": "System (Automated Rule Engine)",
                "status": "completed",
                "details": "Evaluation EVAL-2026-001 reported Milestone Completion = 'Not Completed'. Breached Rule #rule-1."
            },
            {
                "stage": "Assigned",
                "timestamp": "2026-09-28T11:00:00Z",
                "actor": "Er. R. K. Patel (EE Ahmedabad)",
                "status": "completed",
                "details": "Assigned to ABC Infrastructure Site Resident Engineer & Circle Assistant Engineer Er. A. Desai."
            },
            {
                "stage": "Under Review",
                "timestamp": "2026-09-28T14:15:00Z",
                "actor": "Er. A. Desai (Assistant Engineer)",
                "status": "in_progress",
                "details": "Technical inspection underway to assess concrete batching schedule and crane positioning."
            },
            {
                "stage": "Action Initiated",
                "timestamp": None,
                "actor": "Contractor ABC Infrastructure",
                "status": "upcoming",
                "details": "Mobilize emergency night crew and accelerate deck shuttering."
            },
            {
                "stage": "Resolution Submitted",
                "timestamp": None,
                "actor": "Executive Engineer Ahmedabad",
                "status": "upcoming",
                "details": "Submit revised milestone completion report with laboratory strength certs."
            },
            {
                "stage": "Verification",
                "timestamp": None,
                "actor": "State Quality Monitor (SQM)",
                "status": "upcoming",
                "details": "Re-inspection on site to confirm structural completion."
            },
            {
                "stage": "Resolved",
                "timestamp": None,
                "actor": "Superintendent Engineer Ahmedabad",
                "status": "upcoming",
                "details": "Final administrative sign-off and timeline closure."
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
        "parameter": "Drainage & Joint Seal",
        "observed_value": "Poor",
        "severity": "Warning",
        "detected_date": "2026-09-27",
        "responsible_org": "Surat City R&B Division",
        "responsible_employee": "Er. M. S. Vora (Executive Engineer)",
        "status": "ACTION INITIATED",
        "resolution_notes": "Replacement neoprene seal strip cleared from customs; night lane closure requisitioned.",
        "operational_timeline": [
            {
                "stage": "Detected",
                "timestamp": "2026-09-27T08:45:00Z",
                "actor": "System (Automated Rule Engine)",
                "status": "completed",
                "details": "Inspection EVAL-2026-002 flagged Drainage & Joint Seal = 'Poor'."
            },
            {
                "stage": "Assigned",
                "timestamp": "2026-09-27T10:15:00Z",
                "actor": "Er. M. S. Vora (EE Surat)",
                "status": "completed",
                "details": "Assigned to L&T Bridge Maintenance Cell."
            },
            {
                "stage": "Under Review",
                "timestamp": "2026-09-27T16:00:00Z",
                "actor": "Er. Jagdish Mehta (NDT Auditor)",
                "status": "completed",
                "details": "Seal damage localized to lane 2; steel armor finger joints intact."
            },
            {
                "stage": "Action Initiated",
                "timestamp": "2026-09-28T08:00:00Z",
                "actor": "L&T Specialized Crew",
                "status": "in_progress",
                "details": "Night-time sealing compound mobilization and temporary traffic diversion barricading."
            },
            {
                "stage": "Resolution Submitted",
                "timestamp": None,
                "actor": "L&T Site In-charge",
                "status": "upcoming",
                "details": "Post-installation water tightness test report."
            },
            {
                "stage": "Verification",
                "timestamp": None,
                "actor": "Superintendent Engineer Surat",
                "status": "upcoming",
                "details": "Hydrostatic ponding test verification."
            },
            {
                "stage": "Resolved",
                "timestamp": None,
                "actor": "Surat Circle Authority",
                "status": "upcoming",
                "details": "Certificate of compliance."
            }
        ]
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
        "status": "Awarded",
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
        "status": "Awarded",
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
        "status": "Open for Bidding",
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
        "status": "Under Technical Evaluation",
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
                    "tenders": db.tenders.count_documents({})
                }
            }

        # Clear existing collections if forcing or initial empty
        db.regions_districts.delete_many({})
        db.projects.delete_many({})
        db.evaluations.delete_many({})
        db.issues.delete_many({})
        db.tenders.delete_many({})
        db.audit_logs.delete_many({})

        # Insert seed data
        db.regions_districts.insert_many([dict(item) for item in SEED_REGIONS])
        db.projects.insert_many([dict(item) for item in SEED_PROJECTS])
        db.evaluations.insert_many([dict(item) for item in SEED_EVALUATIONS])
        db.issues.insert_many([dict(item) for item in SEED_ISSUES])
        db.tenders.insert_many([dict(item) for item in SEED_TENDERS])

        # Create indexes for high-performance querying
        db.projects.create_index("id", unique=True)
        db.projects.create_index("district")
        db.projects.create_index("region")
        db.projects.create_index("category")
        db.evaluations.create_index("id", unique=True)
        db.evaluations.create_index("project_id")
        db.evaluations.create_index("evaluator_id")
        db.issues.create_index("id", unique=True)
        db.issues.create_index("project_id")
        db.issues.create_index("status")
        db.tenders.create_index("id", unique=True)

        return {
            "success": True,
            "message": "PRAVI MongoDB seeded successfully with Gujarat R&B dataset.",
            "counts": {
                "projects": len(SEED_PROJECTS),
                "evaluations": len(SEED_EVALUATIONS),
                "issues": len(SEED_ISSUES),
                "tenders": len(SEED_TENDERS)
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
