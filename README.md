# PRAVI

> **PRAVI — Public Road & Infrastructure Visibility & Intelligence**

PRAVI is a digital infrastructure monitoring and visibility system designed to improve how public road and infrastructure projects are **tracked, verified, maintained, and communicated** across different stakeholders.

The system focuses on solving fragmented information, lack of continuous monitoring, delayed maintenance, and limited public visibility by establishing a centralized source of truth and an operational workflow around infrastructure assets.

---

## Problem :

Public infrastructure projects, particularly road construction and maintenance, involve multiple stakeholders such as government departments, district-level employees, evaluators, contractors, and citizens.

The research identified several major problems:

### 1. No Single Source of Truth

Information about an infrastructure project can exist across different sources and stakeholders.

For example:

* Project information may be maintained by one department.
* Construction updates may be available through another system.
* Inspection information may exist separately.
* Maintenance complaints may be handled independently.
* Citizens may have completely different information from government records.

This creates **information fragmentation and inconsistency**.

### 2. Complaint-Based Instead of Monitoring-Based Maintenance

Traditional maintenance workflows are often reactive:

> Problem occurs → Citizen complains → Department receives complaint → Inspection → Resolution

This means that infrastructure problems may only become visible after they have already affected citizens.

PRAVI proposes a monitoring-oriented approach:

> **Monitor → Detect → Flag → Evaluate → Resolve → Verify**

### 3. Limited Infrastructure Visibility

Citizens generally have limited visibility into:

* What projects are being executed
* Who is responsible
* Current project status
* Expected completion
* Maintenance history
* Quality observations
* Previous issues
* Resolution status

### 4. Fragmented Stakeholder Responsibilities

Different stakeholders operate at different levels.

A state-level authority may have an overall view, while district employees handle operational activities and evaluators perform inspections.

Without a shared system, coordination becomes difficult.

### 5. Maintenance Information Gets Lost Over Time

Infrastructure does not end when construction is completed.

Roads require continuous monitoring and maintenance.

However, operational information such as:

* Previous defects
* Maintenance activities
* Quality observations
* Inspection results
* Resolution history

can become disconnected from the original project.

---

## Solution :

This System proposes a **centralized infrastructure visibility and monitoring platform** that maintains a unified representation of infrastructure projects throughout their lifecycle.

The system connects:

**Project → Infrastructure Asset → Monitoring → Evaluation → Maintenance → Verification → History**

Instead of treating construction and maintenance as separate activities, PRAVI treats them as part of a **continuous infrastructure lifecycle**.

### Core Principle

> **Build a source of truth around the infrastructure asset, not around individual complaints or departments.**

PRAVI provides stakeholders with different views of the same underlying information.

The system can:

* Maintain project and infrastructure information
* Track project lifecycle
* Monitor operational conditions
* Create configurable monitoring rules
* Automatically flag infrastructure issues
* Create operational timelines
* Assign evaluation/verification activities
* Track maintenance activities
* Maintain historical records
* Provide citizens with transparent project information

### Operational Monitoring

PRAVI introduces configurable monitoring conditions.

For example:

```text
Quality = Poor
        ↓
Configured threshold/rule triggered
        ↓
Infrastructure automatically flagged
        ↓
Evaluator/employee notified
        ↓
Inspection / corrective action
        ↓
Maintenance performed
        ↓
Verification
        ↓
Issue closed
```

This changes the workflow from a purely complaint-driven system to a **proactive monitoring and resolution workflow**.

---

## Users :

PRAVI is designed around multiple stakeholder perspectives.

### 1. State

Provides an overall view of infrastructure activities across the state.

Responsibilities include:

* State-level project visibility
* District-level comparison
* Overall infrastructure monitoring
* Project progress monitoring
* High-level analytics

---

### 2. District Employee

Responsible for operational management at the district level.

Responsibilities include:

* Managing infrastructure/project information
* Configuring monitoring parameters
* Tracking project progress
* Monitoring infrastructure conditions
* Managing maintenance activities
* Reviewing automatically generated flags
* Updating operational timelines

---

### 3. Evaluator

Responsible for independent/assigned evaluation and verification activities.

Responsibilities include:

* Reviewing flagged infrastructure
* Performing inspections
* Recording evaluation results
* Verifying maintenance work
* Updating quality observations
* Closing or escalating issues

---

### 4. District-1 / District-2

District-level views are used to represent infrastructure operations at the district level.

A region is treated as a **grouping of districts**, rather than an independent authority.

---

### 5. Third-Party Company

Third-party organizations can participate primarily in **tender-related workflows**.

Their role is intentionally separated from government operational authority.

---

### 6. Citizen

Citizens are primarily consumers of infrastructure information.

They can view:

* Public projects
* Infrastructure status
* Project progress
* Relevant timelines
* Maintenance information
* Evaluation/quality information where publicly available
* Infrastructure history

The goal is to improve **public visibility and transparency**.

---

## Features :

### Project Management

* Project creation
* Project metadata
* Project lifecycle tracking
* Project status
* Assigned stakeholders
* Project timelines

### Infrastructure Asset Management

Each infrastructure asset can maintain a persistent history rather than being treated as an isolated complaint.

Information can include:

* Location
* Project association
* Current status
* Quality observations
* Maintenance history
* Evaluation history
* Operational events

### Monitoring & Automatic Flagging

District employees can configure monitoring conditions.

Example:

```text
IF quality == "poor"
AND condition persists
THEN flag infrastructure
```

This allows monitoring logic to be adapted to operational requirements.

### Operational Timeline

PRAVI maintains an operational timeline throughout the infrastructure lifecycle.

Example:

```text
Project Created
      ↓
Tender
      ↓
Construction
      ↓
Evaluation
      ↓
Completed
      ↓
Maintenance Monitoring
      ↓
Issue Detected
      ↓
Maintenance
      ↓
Verification
      ↓
Resolved
```

The timeline provides historical context for infrastructure decisions.

### Evaluation & Verification

Evaluators can:

* Review assigned infrastructure
* Record inspection results
* Submit observations
* Verify corrective actions
* Approve or reject resolution

### Maintenance Monitoring

Instead of waiting exclusively for citizen complaints, PRAVI can identify infrastructure conditions through configured monitoring rules.

This supports:

* Preventive maintenance
* Condition-based maintenance
* Issue tracking
* Resolution tracking
* Verification

### Tender Management

Third-party organizations can participate in tender-related workflows.

This provides a structured mechanism for:

* Tender creation
* Tender information
* Participating organizations
* Tender status
* Project association

### Citizen Transparency

Citizens can access relevant public infrastructure information without requiring internal government credentials.

The objective is to expose useful information while keeping operational workflows restricted to appropriate stakeholders.

### Role-Based Views

PRAVI provides different dashboards according to stakeholder type.

The same underlying infrastructure information can therefore be presented differently to:

```text
State
  ↓
District Employee
  ↓
Evaluator
  ↓
Citizen
```

---

## Architecture :

PRAVI follows a layered web architecture.

```text
                    ┌──────────────────────┐
                    │       Citizens       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    React Frontend    │
                    │ Dashboards / UI / UX │
                    └──────────┬───────────┘
                               │
                         REST / HTTP
                               │
                    ┌──────────▼───────────┐
                    │    FastAPI Backend   │
                    │ Business Logic / API │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────▼─┐   ┌─▼──────────┐
                 │    MySQL   │   │  MongoDB   │
                 │ Structured │   │ Operational│
                 │    Data    │   │ / Flexible │
                 └────────────┘   └────────────┘
```

### Data Layer

PRAVI uses different database technologies according to the nature of the information.

**MySQL**

Used for structured and relational information such as:

* Users/stakeholders
* Projects
* District relationships
* Tender information
* Structured records

**MongoDB**

Used where flexible or evolving document-oriented information is useful, such as:

* Monitoring observations
* Operational events
* Evaluation records
* Infrastructure condition information
* Timeline/event data

### Architectural Principle

The system separates:

```text
Structured relational information
                +
Flexible operational information
                +
Infrastructure lifecycle events
```

This allows PRAVI to accommodate infrastructure data that may evolve over time.

---

## Tech Stack

* **Frontend**: React
* **Backend**: FastAPI
* **Database**: MySQL, MongoDB
* **Other**:

  * REST APIs
  * JWT / application-level authorization where required
  * Docker
  * Git / GitHub
  * Cloud deployment
  * Automated monitoring/flagging logic
  * Event/timeline-based operational tracking

---

## How it works :

The PRAVI workflow can be understood as an infrastructure lifecycle.

### Step 1 — Project Creation

A project is registered with its relevant:

* Location
* District
* Infrastructure information
* Stakeholders
* Timeline
* Project status

---

### Step 2 — Project Execution

The project progresses through its operational lifecycle.

```text
Planned
   ↓
Tender
   ↓
Awarded
   ↓
Under Construction
   ↓
Evaluation
   ↓
Completed
```

---

### Step 3 — Infrastructure Monitoring

After completion, infrastructure does not disappear from the system.

It remains an active asset that can be monitored.

Conditions and monitoring parameters can be configured according to operational requirements.

---

### Step 4 — Automatic Detection

When a configured condition is satisfied, the system can automatically generate a flag.

Example:

```text
Infrastructure Condition
        ↓
Quality = Poor
        ↓
Monitoring Rule Triggered
        ↓
Issue Flag Created
```

---

### Step 5 — Evaluation

The flagged infrastructure can be assigned to an evaluator.

The evaluator records:

* Inspection result
* Observed condition
* Severity
* Supporting information
* Recommended action

---

### Step 6 — Maintenance / Resolution

If corrective action is required, the issue moves into the maintenance workflow.

```text
Flagged
  ↓
Under Review
  ↓
Maintenance Required
  ↓
Maintenance In Progress
  ↓
Maintenance Completed
```

---

### Step 7 — Verification

Completion of maintenance does not automatically mean the issue is resolved.

An evaluator can verify whether the corrective action actually addressed the problem.

```text
Maintenance Completed
        ↓
Verification
        ↓
 ┌──────┴──────┐
 ↓             ↓
Pass          Fail
 ↓             ↓
Resolved    Re-open /
            Escalate
```

This prevents the system from considering an issue resolved merely because a maintenance activity was marked as completed.

---

### Step 8 — Historical Record

All significant events remain associated with the infrastructure.

Therefore, future stakeholders can understand:

```text
What happened?
When did it happen?
Who handled it?
What was observed?
What action was taken?
Was the action verified?
```

This creates an infrastructure-level historical record.

---

## Limitations :

PRAVI is currently a prototype/research-oriented system and has several limitations.

### 1. Data Availability

The quality of the system depends heavily on the quality and availability of infrastructure data.

If source data is:

* incomplete
* outdated
* incorrect
* inconsistent

the system cannot automatically guarantee accurate results.

### 2. Monitoring Accuracy

Automatic flagging depends on configured rules and available data.

Poorly configured thresholds may generate:

* False positives
* False negatives

Therefore, automated detection should support human evaluation rather than completely replace it.

### 3. Real-World Integration

The prototype does not necessarily integrate with all existing government systems.

Actual deployment would require integration with existing:

* Project management systems
* GIS systems
* Tender platforms
* Government databases
* Inspection systems
* Citizen service platforms

### 4. Hardware / Sensor Dependency

Advanced continuous infrastructure monitoring may require external sources such as:

* IoT sensors
* Road-condition sensors
* GPS
* CCTV
* Satellite imagery
* Mobile inspection applications

These are outside the scope of the current prototype.

### 5. Prototype-Level Authorization

The prototype prioritizes demonstrating the workflow and system architecture.

A production deployment would require stronger:

* Authentication
* Authorization
* Audit logging
* Encryption
* Access control
* Data governance

### 6. Scalability

A production government-scale deployment would require additional work around:

* High availability
* Database scaling
* Caching
* Background processing
* Observability
* Disaster recovery
* Load balancing

---

## Future work :

### 1. GIS Integration

Integrate geographic information systems to visualize infrastructure directly on maps.

Possible interface:

```text
State
 └── District
      └── Roads
           └── Infrastructure Assets
                └── Issues
```

---

### 2. IoT-Based Monitoring

Connect infrastructure sensors to automatically collect real-time condition data.

Potential parameters include:

* Surface condition
* Structural condition
* Traffic
* Environmental conditions
* Temperature
* Vibration

---

### 3. Computer Vision

Use computer vision to analyze images/videos captured during inspections.

Possible applications:

* Pothole detection
* Crack detection
* Road-surface analysis
* Damage classification
* Construction progress monitoring

---

### 4. Predictive Maintenance

Move from:

> Detecting existing problems

towards:

> Predicting potential infrastructure failures.

Historical infrastructure data could be used to estimate maintenance requirements and prioritize inspections.

---

### 5. AI-Assisted Evaluation

AI could assist evaluators by:

* Summarizing inspection reports
* Comparing historical observations
* Detecting anomalies
* Extracting information from documents
* Generating preliminary inspection insights

Final decisions should remain with authorized human stakeholders.

---

### 6. Government System Integration

Integrate PRAVI with existing infrastructure and government platforms to reduce duplicate data entry and create a more complete source of truth.

---

### 7. Advanced Analytics

Future dashboards could provide:

* Infrastructure condition trends
* Maintenance frequency
* Resolution time
* District-level operational statistics
* Recurring infrastructure issues
* Project lifecycle analysis

---

### 8. Mobile Inspection Application

A dedicated mobile application could allow field evaluators to:

* Capture photographs
* Record GPS coordinates
* Submit inspection reports
* Update infrastructure conditions
* Work with limited connectivity
* Synchronize data when connectivity is restored

---

## Research Direction

The central research direction of PRAVI is:

> **How can public infrastructure management move from fragmented, reactive complaint handling toward a centralized, continuously monitored, lifecycle-oriented system?**

PRAVI explores this through three core principles:

```text
             PRAVI
               │
     ┌─────────┼─────────┐
     ↓         ↓         ↓
Source of   Continuous  Lifecycle
 Truth      Monitoring  Tracking
     │         │         │
     └─────────┼─────────┘
               ↓
        Better Visibility
               ↓
       Faster Identification
               ↓
        Verified Resolution
```

The long-term objective is not simply to build another complaint-management platform.

It is to create a **persistent digital representation of public infrastructure**, where its project history, operational condition, evaluations, maintenance activities, and verification records remain connected throughout its lifecycle.
