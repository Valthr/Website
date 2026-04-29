// qa.js — Precomputed Q&A pairs for the Valthr research assistant.
// Answers are grounded in the Valthr Group Report (assets/GROUP_01_Drone Delivery.pdf) and general knowledge.
// See assets/js/chatbot.js + assets/js/classifier.js for consumers.
//
// Total entries: 392. Used as the autocomplete bank, the Gemini fallback bank,
// and the source corpus for the local TF-IDF classifier.

window.VALTHR_QA = [

  {
    id: "comms",
    category: "Architecture",
    chip: "Will route plans be sent via Wi-Fi mesh or LTE/5G?",
    question: "Will the delivery route plans be sent to the drones via Wi-Fi mesh or LTE/5G?",
    answer: `**Wi-Fi mesh** was selected over LTE/5G for route uplink.

- **Lower cost** than a dedicated cellular rollout.
- Drones operate within **predefined air corridors** between the nine micro-base stations, so connectivity is only required along those corridors — full-area cellular coverage is unnecessary.
- This **reduces infrastructure** and also **improves safety** by limiting where drones can fly to communicate.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "methodology-pm",
    category: "Methodology",
    chip: "Is Agile-Scrum the right project management methodology?",
    question: "Is Agile-Scrum the most appropriate project management methodology for this proposal?",
    answer: `**Yes — Agile-Scrum was selected over PRINCE2.**

**Why Agile-Scrum wins for this project:**
- PRINCE2's extensive documentation and multi-level controls would slow a **5-person team** with limited PRINCE2 experience.
- Agile is **designed for self-managed teams** (≤9 members) and was already the team's natural working style.
- The **sprint model** suits iterative work with **Bahrain CAA** to establish flying-beyond-line-of-sight regulations.
- Lessons from incidents like Amazon Prime Air highlight the need for continuous stakeholder communication and refinement.

**How it will be implemented:**
- Product Backlog derived from the Requirements table (§13).
- ≥2 concurrent sprints (subject to Scrum Master approval).
- Digital **Kanban board in Notion**, meetings every other day, burn-down charts shared with stakeholders.
- Each sprint ends with verification testing + stakeholder review.
- **Lessons Log** and **Risk Register** from PRINCE2 are integrated to keep knowledge capture and risk discipline.
- **ITIL** supports cost estimation/budgeting via a configuration management database.

*Source: §6.1 Selecting Project Management methodology.*`
  },

  {
    id: "methodology-impl",
    category: "Methodology",
    chip: "What implementation methodology was chosen?",
    question: "What implementation methodology was selected and why?",
    answer: `The **Spiral model** was selected, with **V-model principles integrated into the prototyping and simulation phases**.

**Why Spiral:**
- **Risk-driven emphasis** — autonomous drones in an industrial refinery present significant safety and operational risk, and BVLOS flight is currently illegal in Bahrain without approval.
- Aligns with each spiral phase being decomposable into Agile sprints.
- Backed by the **IEEE/ISO/IEC 12207** standard.

**Why not the alternatives:**
- **Waterfall, Parallel Development, V-model** — excluded outright; do not adapt to changing requirements.
- **Incremental Development** — would unnecessarily extend the timeline.
- **Iterative Enhancement** — would introduce excessive cost and unpredictable iteration counts.

**V-model integration** ensures testing and development are planned in parallel during prototyping/simulation, supporting cooperation with Bahrain's CAA.

*Source: §6.2 Selecting Project Implementation methodology.*`
  },

  {
    id: "capex-opex",
    category: "Cost",
    chip: "What is the CAPEX, OPEX, and cost per mission?",
    question: "What is the estimated CAPEX, OPEX, and cost per mission?",
    answer: `**Headline numbers** (from Activity-Based Costing, §7):

| Metric | Value |
|---|---|
| Total CAPEX | **£191,980** |
| Total OPEX | **£227,441 / year** |
| Cost per mission | **£12.86** (£10.29 OPEX + £2.57 amortised CAPEX over 5 yrs) |
| Annual missions | 22,100 (100/day × 221 working days) |

**Per-activity breakdown (£/mission):**
- Drone Operations — £5.13
- Maintenance & Asset Support — £2.99
- Compliance & Safety — £1.77
- Technology & Systems — £1.65
- Infrastructure Setup — £1.33

**By phase:**
- **Phase 1 — Setup** (months 1–3): £248,840
- **Phase 2 — Pilot Operations** (months 4–6): £56,860
- **Phase 3 — Full Operations** (month 6+): £227,441 / year

*Source: §7.3 ABC Approach Executive Costing Summary, §7.5 Cost distribution by phase.*`
  },

  {
    id: "routing",
    category: "Architecture",
    chip: "How does the routing / fleet optimiser work?",
    question: "How does the routing algorithm and fleet optimiser work?",
    answer: `The fleet management system is modelled as a **graph**:

- **Nodes** — 9 stations selected via Google Maps using available space, proximity to important buildings, and even spatial distribution.
- **Edges** — predefined air corridors between stations.
- **Edge weights** — geographical distance (modifiable in future).
- Not all node pairs are connected — this **simplifies airspace management**.

**Algorithm:**
- **Floyd–Warshall** pre-computes all-pairs shortest paths at initialisation.
- **High-priority deliveries** — nearest available (or soon-to-be-available) drone is dispatched along the shortest path.
- **Low-priority deliveries** — the optimiser evaluates all drones and inserts the task into the route with the **smallest additional distance**, improving overall fleet efficiency.

A **MATLAB prototype** with real station coordinates was built and validated. It supports route visualisation, playback, and a delivery queue with mixed priorities.

**Future:** add a second road-based graph weighted by driving time, so the optimiser can compare drone vs. truck availability and pick the most efficient mode.

*Source: §5.2 Detailed architecture of the fleet management system, §5.3 Output generated by the fleet management optimiser.*`
  },

  {
    id: "fleet",
    category: "Architecture",
    chip: "What is the fleet composition and station layout?",
    question: "What is the fleet composition and where are the stations?",
    answer: `**Fleet:** 23 drones total — **20 operational + 3 spares** for maintenance coverage.

**Nine micro-base stations** distributed across the 2.5 × 2 km refinery footprint:

1. Main Building / Cafeteria
2. North-West Refinery
3. North-East Refinery
4. Bapco Water Treatment Plant
5. Bapco Fluid Catalytic Cracking Unit
6. Bapco Modernization Programme Building
7. Central Refinery
8. Fabrication Workshop
9. South Refinery

Each station serves as a node in the fleet management graph, with predefined air corridors between selected pairs (not all pairs are connected, by design).

**Operational capacity:** 1,326 operational hours per year (221 × 8-hour days at 75 % effective utilisation), supporting the 22,100 annual mission volume.

*Source: §5.2, §7.2 Operational Parameters.*`
  },

  {
    id: "architecture",
    category: "Architecture",
    chip: "What does the system architecture look like?",
    question: "What does the high-level system architecture look like?",
    answer: `The system has **eight components**, split between software and hardware.

**Request flow:**
1. Users submit deliveries via **rugged on-site tablets** or office computers — they can see queues, ETAs, and drone status.
2. Requests go to either a **cloud** or **on-site edge server**.
3. The server runs **fleet optimisation** and assigns the route to a specific drone.

**Edge vs cloud:** chosen based on Bapco's existing infrastructure and cybersecurity policies.
- *Edge* — lower latency, keeps operating during WAN outages.
- *Cloud* — easier to scale and maintain.

**In-flight autonomy:**
- **Navigation** — GPS (~5 m accuracy). High-precision RTK GPS deemed unnecessary because…
- **Landing** — **AprilTag fiducial markers** + downward-facing camera deliver centimetre-level landing precision.
- **Obstacle avoidance** — onboard, using forward-facing cameras with real-time path adjustments.
- **Charging** — wireless charging docks; routed by the optimiser when battery is low. No manual battery swaps.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "risks",
    category: "Risk",
    chip: "What are the highest-priority risks and mitigations?",
    question: "What are the highest-priority risks and how are they mitigated?",
    answer: `Risks scored as **RPN = Probability × Impact** (each 1–5). The top-ranked items:

| # | Risk | RPN | Mitigation |
|---|---|---|---|
| B2 | **Battery overheating** on hot days | 20 | ATEX-rated packs + thermal monitoring |
| B3 | **GPS shadowing** in refinery structures | 16 | High-precision GPS + sensor-based backup nav |
| D5 | **Severe weather** disruption | 16 | Weather thresholds and pre-launch checks |
| B1 | **Sensor failure** affecting navigation | 15 | Redundant sensing + safe-return mode |
| E1 | **Civil aviation approval** delays | 15 | Early engagement with **BCAA** |
| E2 | **ATEX certification** delay | 15 | Pre-certification testing |

Risks are organised into six categories: Strategic (A), Technical (B), AI & Data (C), Operational & Safety (D), Regulatory & Compliance (E), and Financial & Commercial (F).

*Source: §8.1–§8.6 Risk register.*`
  },

  {
    id: "kpis",
    category: "Operations",
    chip: "What KPIs and quality controls are defined?",
    question: "What KPIs and quality assurance controls are in place?",
    answer: `Five operational KPIs with named owners and a linked-risk reference:

| KPI | Target | Frequency | Owner |
|---|---|---|---|
| **System availability** | ≥ 98 % uptime | Weekly | Operations Manager |
| **Mission success rate** | ≥ 95 % successful missions | Weekly | Drone Operations Lead |
| **Safety incident rate** | < 1 per 100 flights | Monthly | Bapco Safety Officer |
| **Regulatory compliance** | 100 % valid certifications | Quarterly | Bapco Legal Team |
| **Operational cost variance** | ≤ 5 % deviation from forecast | Monthly | Project Implementation / Finance Lead |

**Operations Plan:** the Drone Operations Manager owns mission scheduling and performance monitoring; the Safety Officer owns HSE/regulatory compliance. Preventive maintenance is driven by **flight hours and battery cycles**, supplemented by vendor SLAs for critical technical support.

*Source: §8.7 Quality assurance controls.*`
  },

  {
    id: "requirements",
    category: "Process",
    chip: "How were the project requirements developed?",
    question: "How were the project requirements developed and prioritised?",
    answer: `A two-step approach:

**1. Stakeholders** — mapped on a **Mendelow power-interest matrix**, with each stakeholder scored 1–10 for both power and interest by team consensus and recorded in a database. Internal stakeholders shown in yellow, external in teal.

**2. Requirements** — gathered via market research and direct outreach to **Mr. Basheer at Bapco** (email thread in Appendix §15). They were then prioritised using **MoSCoW**:

- **Must** — score ≥ 9
- **Should** — score 5–8
- **Could** — score 1–4

Scores were refined through **individual blind scoring followed by group discussion** to reduce anchoring bias.

Requirements are split across five categories:
- **FR** — Functional
- **NFR** — Non-Functional
- **IR** — Implementation
- **CR** — Contractual
- **DV** — Deliverable

*Source: §2.1 Stakeholders, §2.2 Tables of Requirements.*`
  },

  {
    id: "critical-path",
    category: "Schedule",
    chip: "What is the critical path and longest activity?",
    question: "What is the critical path and which activity is longest?",
    answer: `All activities on the critical path carry **zero total float** — any slippage on these tasks delays the project end date.

**Longest individual activity on the critical path:** **Software Development and Validation**. It therefore warrants the closest schedule monitoring.

**Convergence point:** parallel work streams — payload, infrastructure setup, regulatory & compliance — feed into the critical path at the **integration and commissioning stage in week 22**, making this a key risk point where slippage in any feeder activity could impact the overall timeline.

*Source: §4.1 Critical Path Analysis.*`
  },

  {
    id: "contract",
    category: "Contract",
    chip: "What are the key contract clauses (SLA, payment, warranty)?",
    question: "What are the key contract clauses for SLA, payment, and warranty?",
    answer: `**Payment schedule** (linked to objective deliverables):
- 10 % on signature
- 15 % at PDR (Preliminary Design Review) sign-off
- 20 % on hardware delivery
- 20 % on FAT pass
- 25 % on SAT pass + 30-day Pilot achieving ≥ 95 % mission success
- 10 % on pilot programme completion

**SLA (from SAT):**
- Platform uptime **≥ 99.5 % per month**
- **Priority-1** incidents — response within 30 min, workaround within 4 h, permanent fix within 20 business days
- 2 % service credit per monthly breach (capped at 20 %)
- Three consecutive breaches = material breach, allowing early termination

**Defect rectification:**
- **S1** (safety/critical) — 5 business days
- **S2** (major function impaired) — 15 business days
- **S3** (minor) — next scheduled release

**Warranty:**
- Drones — **24 months or 3,000 flight-hours**
- Batteries — **12 months or 500 cycles** with ≥ 80 % capacity retention
- Free replacements/temporary units if repairs exceed 14 business days

*Source: §10 Project Contract — clauses 5, 9, 10, 11.*`
  },

  {
    id: "data-cyber",
    category: "Contract",
    chip: "What are the data ownership and cybersecurity terms?",
    question: "What are the data ownership and cybersecurity terms?",
    answer: `**Data ownership and residency (clause 16):**
- All operational data — flight logs, telemetry, maintenance records, mission history — is **Bapco property**.
- Supplier-held data must be **exportable in non-proprietary formats within 15 business days** on request or termination, at no extra cost.
- **Data shall not be transferred outside Bahrain** without written authorisation.

**Cybersecurity (clause 15):**
- Implementation must align with **ISO 27001**.
- Suspected or confirmed breaches must be reported within **24 hours**, with containment action initiated upon detection.

**Source code escrow (clause 19):**
- All software developed specifically for Bapco is placed with an independent escrow, updated at each release.
- Source code is released on **Supplier insolvency**, **cessation of support**, or any **unremedied material breach unresolved for more than 60 days**.

**IP licensing (clause 18):**
- Bapco receives a **perpetual, royalty-free, irrevocable licence** to use, modify, and operate all delivered hardware and documentation.
- Supplier indemnifies Bapco against third-party IP claims.

*Source: §10 Project Contract — clauses 15, 16, 18, 19.*`
  },

  {
    id: "a-client-problem",
    category: "Project",
    chip: "What problem does Valthr solve?",
    question: "In one paragraph, what is the client challenge Valthr is addressing at BAPCO?",
    answer: `BAPCO's refinery currently relies on **manual transport** of samples, tools, and critical items across a large, complex site. This creates **delays**, **operational inefficiencies**, and **unnecessary personnel exposure to hazardous areas**. Valthr proposes an autonomous drone delivery network to automate internal logistics, enabling rapid on-demand transport of lightweight payloads between refinery zones, improving speed, precision, safety, and supporting BAPCO's digital transformation strategy.

*Source: §1.1 Context and client challenge.*`
  },

  {
    id: "a-system-footprint",
    category: "Project",
    chip: "Footprint and fleet size",
    question: "What is the proposed operating footprint and fleet size for the drone network?",
    answer: `The proposed solution operates across the refinery's **2.5 × 2 km footprint** with a fleet of **20 electric drones** stationed at distributed micro-bases and coordinated through a central operations hub. The network supports lab sample transport, delivery of small tools and spare parts, and emergency deployment of safety equipment.

*Source: §1.2 Proposed project.*`
  },

  {
    id: "a-dispatch-platform",
    category: "Project",
    chip: "How are tasks allocated?",
    question: "How does the AI-driven dispatch platform allocate tasks to drones?",
    answer: `The AI-driven dispatch platform allocates tasks **dynamically** based on four factors:

- **Priority**
- **Payload requirements**
- **Battery status**
- **Proximity**

This optimises fleet utilisation in real time. The design also incorporates intrinsically safe components for hazardous zones, geofencing, redundant communications, and automated fail-safe protocols.

*Source: §1.2 Proposed project.*`
  },

  {
    id: "a-mendelow-method",
    category: "Stakeholders",
    chip: "How was Mendelow’s matrix used?",
    question: "How exactly did Valthr apply Mendelow’s matrix to identify stakeholders?",
    answer: `Valthr drafted a **stakeholder power-interest map** by researching and listing all stakeholders, with each position on the grid assigned by **team consensus**. Based on their position on Mendelow's Matrix, stakeholders were assigned a score from **1–10 for both power and interest** and recorded in a database. Internal stakeholders were shown in yellow and external in teal on the figure.

*Source: §2.1 Stakeholders (Figure 1).*`
  },

  {
    id: "a-moscow-bands",
    category: "Process",
    chip: "MoSCoW scoring bands",
    question: "What numerical bands does Valthr use for MoSCoW prioritisation?",
    answer: `Valthr classified requirements using **MoSCoW prioritisation** with the following criticality bands:

| Band   | Score range |
|--------|-------------|
| Must   | ≥ 9       |
| Should | 5–8       |
| Could  | 1–4       |

Scores were refined via **individual blind scoring followed by group discussion** to reduce bias.

*Source: §2.1 Stakeholders.*`
  },

  {
    id: "a-requirement-categories",
    category: "Requirements",
    chip: "Five requirement categories",
    question: "What are the five categories Valthr split requirements into, and which tables hold them?",
    answer: `Requirements are split across five tables:

- **Table 1 — Functional Requirements (FR)**
- **Table 2 — Non-Functional Requirements (NFR)**
- **Table 3 — Implementation Requirements (IR)**
- **Table 4 — Contractual Requirements (CR)**
- **Table 5 — Deliverable Requirements (DV)**

An extended table including stakeholder mapping and additional columns is in Section 13 (Appendix 3).

*Source: §2.2 Tables of Requirements.*`
  },

  {
    id: "a-fr17-vs-fr20",
    category: "Requirements",
    chip: "Geofencing vs GPS criticality",
    question: "Why is FR17 (Geofencing) rated criticality 9 while its complexity is only 5, compared to FR20 (Precision GPS)?",
    answer: `**FR17 — Geofencing**: criticality **9**, complexity **5**. The drone *cannot* exit a predefined boundary; attempts are logged and flight aborted near the limit. The high criticality reflects safety/regulatory exposure inside a refinery, while complexity is moderate because the boundary check is a well-understood software guard.

**FR20 — Precision navigation (GPS)**: criticality **9**, complexity **7**. Positioning accuracy must be **≤1.0 m** for nominal operations. Higher complexity reflects sensor fusion / GPS-equivalent integration work.

Both are Must-haves, but geofencing is enforced as a deterministic boundary, whereas precision navigation requires harder real-world tuning.

*Source: §2.2 Tables of Requirements (FR17, FR20).*`
  },

  {
    id: "a-fr-safety-musts",
    category: "Requirements",
    chip: "Top safety-critical FRs",
    question: "Which functional requirements directly support emergency response and safe failure?",
    answer: `Several FRs cluster around safe failure and emergency response, all rated criticality **9**:

- **FR4 Manual Override** — operator can assume control / command land within ≤2 s command latency.
- **FR9 Return to base** — RTH starts on mission complete or low battery; dock confirms via NFC tag.
- **FR22 Emergency stop command** — E-stop triggers immediate controlled descent and land.
- **FR23 Landing zone safety check** — confirm pad clear or flag obstacle to ground control.
- **FR25 Automated pre-flight check** — launch blocked on critical failure (battery, GPS, motors).
- **FR36 Weather gating** — launch prevented if wind/visibility breach thresholds.

*Source: §2.2 Tables of Requirements (FR4, FR9, FR22, FR23, FR25, FR36).*`
  },

  {
    id: "a-fr1-payload",
    category: "Requirements",
    chip: "What does FR1 say?",
    question: "What is the payload capacity defined in FR1, and what is its priority?",
    answer: `**FR1 Payload Capacity** — criticality **6**, complexity **7**. The drone must carry **≥2.0 kg payload (assumption)** including a sealed sample box. As a Should-have it is important but not blocking, with complexity reflecting airframe and lift design trade-offs.

*Source: §2.2 Tables of Requirements (FR1).*`
  },

  {
    id: "a-nfr-overview",
    category: "Requirements",
    chip: "What does NFR cover?",
    question: "What does the Non-Functional Requirements (NFR) table cover at BAPCO?",
    answer: `The NFR table captures qualities the system must exhibit, rather than specific behaviours. Items include:

- **NFR1** Drone registered with **CAA** (Bahrain civil aviation authority).
- **NFR2** Service life ≥5 years or ≥6500 flight cycles.
- **NFR3** Fail-safe landing in emergencies (criticality 9).
- **NFR4** Supplier lead time ≤4 weeks for spares.
- **NFR5** Minimal disruption to other site operations.
- **NFR6** Drone within CAA weight standards.
- **NFR7** Cybersecurity — threat model + auth/encryption/logging (criticality 9).
- **NFR8** GUI for mission creation, live tracking, alerts, RBAC.
- **NFR9** Compliance with refinery **ATEX** / Zone 2 standards (criticality 9, complexity 9).
- **NFR10** Operates at 10–50 °C, humidity <90%.
- **NFR11** Spare parts stock to maintain drones for 6 months unaided.

*Source: §2.2 Tables of Requirements (NFR1–NFR11).*`
  },

  {
    id: "a-nfr9-atex",
    category: "Requirements",
    chip: "ATEX Zone 2 (NFR9)",
    question: "Why is NFR9 (ATEX compliance) rated 9/9 — what does it require?",
    answer: `**NFR9 Compliance with refinery ATEX safety standards** is rated criticality **9** and complexity **9** — the highest joint score in the NFR table. The drone must be **certified or assessed for Zone 2** where applicable, or flight paths must maintain a safe standoff. The high complexity reflects the difficulty of certifying battery-powered electronics for explosive atmospheres in a refinery; the high criticality reflects that any non-compliance is a hard regulatory blocker.

*Source: §2.2 Tables of Requirements (NFR9).*`
  },

  {
    id: "a-ir-overview",
    category: "Requirements",
    chip: "Implementation Requirements (IR)",
    question: "What kinds of items appear in the Implementation Requirements (IR) table?",
    answer: `IR captures what's needed to put the system into operation at BAPCO:

- **IR1** Operator training.
- **IR2** Number of flights before fail (5-year lifespan = X operating hours).
- **IR3** Operational hours align with refinery hours.
- **IR4** Data stored in accordance with local legislation.
- **IR5** Restricted areas — geofencing within CAA limits.
- **IR6** Edge computing capacity onboard drones.
- **IR7** AI-based anomaly detection via external AI provider.
- **IR8** Integration with existing IT infrastructure.
- **IR9** Drone bases secured to **ISO 27001:2022** (criticality 9).
- **IR10** Routine maintenance ≥ 200 flight hours or 3 months.

*Source: §2.2 Tables of Requirements (IR1–IR10).*`
  },

  {
    id: "a-cr-must-haves",
    category: "Requirements",
    chip: "Must-have contractual terms",
    question: "Which contractual requirements are rated Must-have (criticality 9)?",
    answer: `From Table 4, the criticality-9 contractual items are:

- **CR1** 24/7 technical support from engineers.
- **CR2** Supplier references and track record (industrial / hazardous deployments).
- **CR3** Cloud SLA defining uptime %, response times, escalation, breach penalties.
- **CR5** Liability and insurance — caps, third-party insurance, indemnities.
- **CR6** Data ownership & retention — BAPCO owns operational data.
- **CR7** Compliance evidence package for Bahrain regulations.
- **CR9** Security and vulnerability response — disclosure process and patch timelines.

CR4 (warranty/spares), CR8 (training/handover), and CR10 (termination/exit) are Should-haves at criticality 6.

*Source: §2.2 Tables of Requirements (CR1–CR10).*`
  },

  {
    id: "a-dv-deliverables",
    category: "Requirements",
    chip: "Key deliverables (DV)",
    question: "What are the deliverables Valthr commits to producing for this PoC?",
    answer: `The Deliverable Requirements (Table 5) commit Valthr to ten outputs, almost all rated criticality 9:

1. **DV1** Stakeholder map.
2. **DV2** Hazard and risk register (intrinsic safety, ops, cyber, environmental, regulatory).
3. **DV3** Operational concept use-cases — ≥5 mission workflows with decision trees.
4. **DV4** Requirements specification with criticality/complexity and acceptance criteria — ≥85 items.
5. **DV5** Concept of Operations (ConOps).
6. **DV6** High-level system architecture diagrams + one detailed functional flow.
7. **DV7** Preliminary CAD/packaging concept.
8. **DV8** Safety and regulatory assessment for Bahrain.
9. **DV9** Test and validation plan with staged pilot.
10. **DV10** Implementation roadmap from PoC to pilot to scale-out.

*Source: §2.2 Tables of Requirements (DV1–DV10).*`
  },

  {
    id: "a-fr32-audit-log",
    category: "Requirements",
    chip: "Why immutable mission logs?",
    question: "What does FR32 require, and why is its complexity only 3?",
    answer: `**FR32 Mission audit log** — criticality **9**, complexity **3**. Every mission must produce an **immutable log** including mission ID, route, times, confirmations, and anomalies. The high criticality reflects regulatory and incident-investigation needs; complexity is low because append-only logging with hashing is a well-understood pattern, mostly implementation rather than research.

*Source: §2.2 Tables of Requirements (FR32).*`
  },

  {
    id: "b-wbs-definition",
    category: "WBS",
    chip: "What is the WBS and how is it organised?",
    question: "What is the Work Breakdown Structure and how is it organised in this project?",
    answer: `The **WBS is a deliverable-oriented hierarchical decomposition** of the Proof of Concept (PoC), where each work package produces visible, verifiable outputs (analysis, plans, procedures).

- Requirements are grouped into **operational or functional clusters** with logical links preserved.
- **Level 2 branches** mirror the project's requirement sets and deployment lifecycle, so critical requirements are co-located.
- Example: geofencing spans operational definition and control logic; compliance and data governance are consolidated under data flows.

This structure applies **Separation of Concerns (SoC)** at the requirement level, treating safety, security, compliance, and lifecycle management as distinct streams.

*Source: §3.1 WBS rationale.*`
  },

  {
    id: "b-wbs-soc-rationale",
    category: "WBS",
    chip: "Why apply Separation of Concerns to the WBS?",
    question: "Why does the team apply Separation of Concerns (SoC) at the WBS level for refinery deployment?",
    answer: `For refinery deployment, treating **safety, security, compliance, and lifecycle management as distinct streams** prevents tangled requirement representation and **improves impact analysis and maintainability as constraints evolve**.

This matters in a refinery because constraints (intrinsic-safety zones, regulatory rules, data governance) shift over time, and a flat structure would make it hard to trace which work package owns each concern.

*Source: §3.1 WBS rationale.*`
  },

  {
    id: "b-wbs-branch-1-5",
    category: "WBS",
    chip: "WBS branch 1.5 — Implementation, Software & Virtual Validation",
    question: "What does WBS branch 1.5 (Implementation, Software & Virtual Validation) cover?",
    answer: `Branch **1.5** decomposes the software and virtual-validation work:

| Sub-node | Topic |
|---|---|
| 1.5.1 | Software architecture & decomposition |
| 1.5.2 | Navigation/control logic |
| 1.5.3 | Data flows & interfaces |
| 1.5.4 | Simulation environment & fidelity plan |
| 1.5.5 | Test plan (unit/integration/system) |
| 1.5.6 | Virtual mission tests & acceptance metrics |

*Source: §3.2 WBS diagram.*`
  },

  {
    id: "b-wbs-branch-1-7",
    category: "WBS",
    chip: "WBS branch 1.7 — Safety, QA & Risk Management",
    question: "What sub-nodes does WBS branch 1.7 (Safety, QA & Risk Management) contain?",
    answer: `Branch **1.7** consolidates safety and assurance work into six sub-nodes:

- **1.7.1** Hazard identification (refinery context)
- **1.7.2** Risk assessment (likelihood/impact)
- **1.7.3** Risk mitigation & contingencies
- **1.7.4** Quality assurance approach
- **1.7.5** Verification & Validation (V&V) plan
- **1.7.6** Compliance assumptions (IS/regulatory)

*Source: §3.2 WBS diagram.*`
  },

  {
    id: "b-wbs-branch-1-8",
    category: "WBS",
    chip: "WBS branch 1.8 — Project Planning & Control",
    question: "What is covered under WBS branch 1.8 (Project Planning & Control)?",
    answer: `Branch **1.8** holds the project-management work packages:

- **1.8.1** PERT network & dependencies
- **1.8.2** Gantt schedule & milestones
- **1.8.3** Resource plan (team roles)
- **1.8.4** Progress monitoring & reporting cadence
- **1.8.5** Change control approach
- **1.8.6** Risk register tracking
- **1.8.7** Procurement & Contracting Strategy
- **1.8.8** Cost estimation & budgeting approach

*Source: §3.2 WBS diagram.*`
  },

  {
    id: "b-wbs-branch-1-9",
    category: "WBS",
    chip: "WBS branch 1.9 — Future Development & Roadmap",
    question: "What does WBS branch 1.9 (Future Development & Roadmap) contain?",
    answer: `Branch **1.9** captures the post-PoC pathway:

- **1.9.1** Technical gaps & limitations
- **1.9.2** Certification & approvals pathway
- **1.9.3** Pilot deployment plan
- **1.9.4** Scaling (fleet ops, expansion use cases)

*Source: §3.2 WBS diagram.*`
  },

  {
    id: "b-critical-path-feeders",
    category: "Schedule",
    chip: "Which dependencies feed into the critical path?",
    question: "Which parallel work streams feed into the critical path, and at what point?",
    answer: `The critical path runs through the longest activities, but several **parallel work streams feed in at the integration and commissioning stage**:

- **Payload** development
- **Infrastructure setup**
- **Regulatory & compliance**

These converge at **week 22**, which is the key point where delays from any feeder activity can also impact the overall timeline. **Software Development and validation** is the longest individual activity on the critical path and therefore warrants the closest schedule monitoring. All activities on the critical path carry **zero total float**.

*Source: §4.1 Critical Path Analysis.*`
  },

  {
    id: "b-gantt-parts",
    category: "Schedule",
    chip: "How is the Gantt chart presented?",
    question: "How is the project Gantt chart presented in the report?",
    answer: `The Gantt chart is split across **five figures** (Figures 2–6), each showing a part of the schedule, followed by a **Critical Path Diagram** in Figure 7. The split is required because the schedule is too long to render legibly on a single page.

*Source: §4 Project Gantt Chart and Dependencies.*`
  },

  {
    id: "b-prince2-strengths",
    category: "Methodology",
    chip: "PRINCE2 strengths summarised",
    question: "What are the main strengths of PRINCE2 as evaluated by the team?",
    answer: `Key PRINCE2 strengths the team identified:

- **Bahrain government standardised methodology** — reliable and predictable.
- Project continues only as long as there is a **valid business justification**, avoiding financial losses and maintaining stakeholder trust; strong emphasis on clearly defined deliverables.
- **Time, cost, scope, risk, quality** (and with PRINCE2 7, **sustainability**) tolerances are set at every stage.
- Highly **structured and layered**, stage-by-stage; reviews ensure alignment with requirements; PRINCE2 7 made reporting more digital.
- **Clearly defined roles** and accountability.
- **Substantial planning phase** uses **product-based planning** (define outputs, then work backwards).
- PRINCE2 7 provides improved guidance for **integrating with Agile practices**.

*Source: §6.1 Table 6 — PRINCE2 Management methodology.*`
  },

  {
    id: "b-prince2-weaknesses",
    category: "Methodology",
    chip: "Why was PRINCE2 not selected?",
    question: "Why did the team reject PRINCE2 despite Bahrain government using it?",
    answer: `PRINCE2 was rejected because its weaknesses outweighed its strengths for this team:

- A full project is **delivered at once at the very end**.
- If tolerances are exceeded, there is a **high risk of total project stop**; the full plan is set from beginning to end, so major changes are difficult without revising the entire plan.
- Approvals come from the **Project Board** and may take time; extensive documentation slows progression.
- An **experienced project manager** is required.
- For new or unprecedented projects, initial planning may take a long time and PRINCE2's inflexibility can cause **stagnation**.

The team noted that PRINCE2 7's **extensive documentation would slow progress, particularly given our limited experience with the framework**, and for a **five-person team multiple control levels would be redundant**.

*Source: §6.1 Table 6 and selection narrative.*`
  },

  {
    id: "b-scrum-cadence",
    category: "Methodology",
    chip: "Sprint cadence and tooling specifics",
    question: "What sprint cadence and tooling will the team use to run Agile-Scrum?",
    answer: `Concrete Agile-Scrum implementation specifics:

- Build a **Product Backlog** derived from the Requirements table (Section 13) to ensure clear user stories.
- Run **at least two concurrent sprints**, subject to Scrum Master approval.
- Track progress on a **digital Kanban board in Notion**.
- Hold meetings **every other day**.
- Share **burn-down charts** with the team and stakeholders.
- End each sprint with **testing against predefined verification methods and acceptance criteria**, followed by stakeholder review.
- Integrate an informal **Lessons Log and Risk Register from PRINCE2** to capture knowledge and manage risks.

*Source: §6.1 Selecting Project Management methodology.*`
  },

  {
    id: "b-itil-role",
    category: "Methodology",
    chip: "What role does ITIL play?",
    question: "What role does ITIL play alongside Agile-Scrum in this project?",
    answer: `**ITIL will support cost estimation and budgeting in software development** through a **configuration management database**, which **integrates effectively with Agile-Scrum**.

It is a complementary practice — Agile-Scrum drives delivery, ITIL underpins the cost/configuration discipline that Scrum alone does not prescribe.

*Source: §6.1 Selecting Project Management methodology.*`
  },

  {
    id: "b-iterative-rejected",
    category: "Methodology",
    chip: "Why Iterative Enhancement was rejected",
    question: "Why specifically was the Iterative Enhancement methodology rejected?",
    answer: `Iterative Enhancement was rejected because it would **introduce excessive cost**. From the evaluation:

- Every time you go back a stage, **a new budget and more time are required**.
- It is **more oriented towards fixing already delivered projects** rather than building new ones.
- It **assumes all documentation is available** for efficient version upgrades.
- It can become **expensive and time-consuming**; the number of iterations is hard to predict, so cost and completion date become unpredictable — this might not satisfy the customer.
- Heavy customer communication can invite **scope creep**.

By contrast, Incremental Development was rejected for unnecessarily extending the timeline, while Spiral was selected for its risk-driven emphasis.

*Source: §6.2 Table 9 — Iterative Enhancement Methodology.*`
  },

  {
    id: "b-spiral-vmodel",
    category: "Methodology",
    chip: "Why combine Spiral with the V-model?",
    question: "Why integrate the V-model into the Spiral methodology rather than using Spiral alone?",
    answer: `Spiral was selected for its **risk-driven emphasis**, which suits the safety and operational risks of deploying an autonomous drone delivery system in an industrial environment — and is also why **flying drones outside direct line of sight is illegal in Bahrain**.

To **maximise safety**, the team will integrate **main principles of the V model into the prototyping and simulation phases of the Spiral model**:

- Although this **increases implementation time and cost**, it ensures **testing and development are planned in parallel**.
- All possible issues are tackled through **exhaustive testing**.
- The combination is intended to facilitate the most efficient cooperation with **Bahrain's CAA**.

*Source: §6.2 Selecting Project Implementation methodology.*`
  },

  {
    id: "b-pm-vs-impl-methodology",
    category: "Process",
    chip: "PM methodology vs Implementation methodology",
    question: "What is the difference between the project management methodology and the implementation methodology in this report?",
    answer: `The report treats them as **two separate selections** in §6.1 and §6.2:

| Aspect | Project Management methodology | Project Implementation methodology |
|---|---|---|
| Section | §6.1 | §6.2 |
| Question answered | How is the project run, governed, planned? | How is the technical solution actually built? |
| Candidates evaluated | PRINCE2 vs Agile-Scrum | Incremental vs Iterative vs Spiral |
| Selected | **Agile-Scrum** | **Spiral**, with V-model integrated into prototyping/simulation |

The PM methodology dictates ceremonies, roles, and governance; the implementation methodology dictates how requirements are turned into a working, tested system. Because **Agile-Scrum requires a flexible implementation methodology**, **Waterfall, Parallel Development, and the V model were excluded from the §6.2 analysis** as standalone choices — they don't adapt to changing requirements. The V-model survived only as integrated principles inside Spiral.

*Source: §6.1 and §6.2.*`
  },

  {
    id: "c-apriltag-landing",
    category: "Architecture",
    chip: "AprilTag landing precision",
    question: "What does the drone use to land precisely on a station?",
    answer: `Each drone carries a **downward-facing camera** that detects **AprilTag fiducial markers** placed at the landing pad.

- AprilTags allow **centimetre-level landing precision**.
- This optical approach was chosen instead of high-precision GPS RTK, which the team deemed unnecessary because the AprilTags already give the required landing accuracy.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "c-gps-accuracy",
    category: "Architecture",
    chip: "Why 5m GPS is enough (no RTK)",
    question: "Why is approximately 5m GPS accuracy sufficient instead of high-precision GPS RTK?",
    answer: `In-flight navigation only needs to keep the drone roughly on the predefined air corridor, so **~5m GPS accuracy** is adequate.

The **landing phase** — which is where centimetre precision actually matters — is handled separately by the **AprilTag fiducial markers** detected by the downward-facing camera. Because that optical system already provides centimetre-level landing precision, **GPS RTK was deemed not required**, saving cost and complexity.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "c-edge-vs-cloud",
    category: "Architecture",
    chip: "Edge vs cloud server trade-off",
    question: "How does the team decide between an on-site edge server and a cloud server for fleet optimisation?",
    answer: `Delivery requests submitted from rugged tablets or office computers are sent to **either a cloud or an on-site edge server**, which performs fleet optimisation and assigns a route to a drone.

The choice depends on **BAPCO's current infrastructure and cybersecurity policies**:

| Option | Strengths |
|--------|-----------|
| **Edge server** | Lower latency; continues operating during WAN outages |
| **Cloud** | Easier to scale and maintain |

The report frames this as a deployment-time decision rather than prescribing one option.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "c-obstacle-avoidance-cameras",
    category: "Architecture",
    chip: "Forward vs downward camera roles",
    question: "How does the drone handle obstacle avoidance, and what is each camera responsible for?",
    answer: `The drone uses **two distinct camera roles**:

- **Forward-facing cameras** feed the onboard computer for **local obstacle avoidance**. Short-range path adjustments are calculated **in real time, onboard** the drone.
- **Downward-facing camera** is used for **AprilTag detection** to enable centimetre-level landing precision.

Obstacle avoidance is therefore handled **locally** on the drone, independent of the cloud/edge fleet optimiser.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "c-wireless-charging",
    category: "Architecture",
    chip: "Wireless charging vs battery swap",
    question: "Why use wireless charging docks instead of manual battery swapping?",
    answer: `When a drone needs power, the **fleet optimiser routes it to a wireless charging dock**. Charging then occurs **autonomously, without manual battery replacement**.

The reason given in the report is straightforward: this **increases system autonomy** — no human operator needs to be present at the station to swap batteries, which is consistent with the wider goal of fully autonomous delivery operations at the refinery.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: "c-air-corridors",
    category: "Architecture",
    chip: "Predefined corridors vs free flight",
    question: "Why do the drones fly within predefined air corridors instead of free-flight routing?",
    answer: `Drones operate **within predefined air corridors** rather than freely across the refinery. This decision drives several other architectural choices:

- **Connectivity** is only required along the corridors, so a low-cost **Wi-Fi mesh** suffices instead of LTE/5G.
- It **reduces infrastructure requirements**.
- It **improves safety** by limiting drone flight areas.
- In the graph model, **not all node pairs are connected**, which **reduces possible flight paths and simplifies airspace management**.

*Source: §5.1 High-level architecture; §5.2 Detailed architecture of the fleet management system.*`
  },

  {
    id: "c-station-selection",
    category: "Architecture",
    chip: "How the 9 stations were chosen",
    question: "How were the nine drone stations selected, and what criteria were used?",
    answer: `The nine stations were selected using **Google Maps**, applying three criteria:

1. **Available space**
2. **Proximity to important buildings**
3. **Even spatial distribution**

The chosen stations are:

- Main Building/Cafeteria
- North-West Refinery
- North-East Refinery
- BAPCO Water Treatment Plant
- BAPCO Fluid Catalytic Cracking Unit
- BAPCO Modernization Programme Building
- Central Refinery
- Fabrication Workshop
- South Refinery

*Source: §5.2 Detailed architecture of the fleet management system.*`
  },

  {
    id: "c-priority-dispatch",
    category: "Architecture",
    chip: "High vs low priority dispatch",
    question: "How does dispatch differ between high-priority and low-priority deliveries?",
    answer: `The fleet optimiser uses **two distinct strategies** depending on priority:

- **High-priority deliveries:** the **nearest available (or soon-to-be-available) drone** is dispatched along the **shortest path** (pre-computed by Floyd-Warshall).
- **Low-priority deliveries:** the optimiser **evaluates all drones** and **inserts the task into the route that results in the smallest additional distance**, improving overall fleet efficiency.

In effect, urgent jobs minimise time-to-pickup, while non-urgent jobs minimise marginal route cost.

*Source: §5.2 Detailed architecture of the fleet management system.*`
  },

  {
    id: "c-insertion-complexity",
    category: "Architecture",
    chip: "Complexity of low-priority insertion",
    question: "What is the time complexity of the low-priority insertion step?",
    answer: `The report describes the insertion behaviour qualitatively: for a low-priority task, the optimiser **evaluates all drones** and inserts the task into the route that **results in the smallest additional distance**.

However, **the report does not specify** the formal time complexity of this insertion step, nor the data structures used to evaluate candidate insertion points. Testing is reported only at the level of correctness: "optimal insertion behaviour that aligns with human intuition."

*Source: §5.2 Detailed architecture of the fleet management system; §5.3 Output generated by the fleet management optimiser.*`
  },

  {
    id: "c-matlab-prototype",
    category: "Architecture",
    chip: "MATLAB prototype scope",
    question: "What does the MATLAB prototype actually demonstrate?",
    answer: `A **MATLAB prototype** was built using the **real coordinates of the nine stations**. Its GUI supports:

- **Route visualisation**
- **Playback**
- **Delivery queue simulation** with both **high- and low-priority requests**

Testing **confirmed correct shortest-path computation** and **optimal insertion behaviour that aligns with human intuition**. The report also points to a **YouTube video link** for a demonstration of the GUI output (Figure 10).

*Source: §5.3 Output generated by the fleet management optimiser.*`
  },

  {
    id: "c-road-graph-extension",
    category: "Architecture",
    chip: "Future road-graph extension",
    question: "How could the optimiser be extended to integrate delivery trucks in the future?",
    answer: `The report flags integrating **delivery trucks** as a future improvement. The proposed approach:

- Build a **second, road-based graph** alongside the existing air-corridor graph.
- Use **different edge weights** — specifically **driving time** rather than straight-line distance.
- The system could then **compare drone and truck availability** and **select the most efficient mode of delivery** for each request.

This naturally extends the existing architecture because edges weights are already noted as "easily modifiable."

*Source: §5.3 Output generated by the fleet management optimiser.*`
  },

  {
    id: "c-edge-weights-modifiable",
    category: "Architecture",
    chip: "Edge weights and disconnected pairs",
    question: "What do the graph edges represent, and why are not all node pairs connected?",
    answer: `In the fleet management graph:

- **Nodes** are the nine selected stations.
- **Edges** are **predefined air corridors**.
- **Edge weights** are based on **geographical distance**, and the report notes these can be **easily modified in the future** (for example, swapping in driving time for a road graph).

**Not all node pairs are connected.** The report gives a clear reason: this **reduces possible flight paths and simplifies airspace management**, which complements the safety benefit of confining drones to predefined corridors.

*Source: §5.2 Detailed architecture of the fleet management system.*`
  },

  {
    id: "d-abc-methodology",
    category: "Cost",
    chip: "Activity-Based Costing methodology",
    question: "What is Activity-Based Costing (ABC) and why use it here?",
    answer: `Activity Based Costing (ABC) with time-driven operational rates was used to determine the cost per delivery mission, per activity. Costs were allocated to five primary activities (Infrastructure Setup, Drone Operations, Maintenance & Asset Support, Technology & Systems, Compliance & Safety) based on resource consumption patterns. Costs are split between CapEx and OpEx to clarify initial investment vs ongoing operational costs.

*Source: §7.1 Costing Methodology.*`
  },

  {
    id: "d-mission-breakdown",
    category: "Cost",
    chip: "Per-mission cost breakdown by activity",
    question: "What's the £/mission breakdown by activity?",
    answer: `Per-mission costs total **£12.86**: Infrastructure Setup £1.33, Drone Operations £5.13, Maintenance & Asset Support £2.99, Technology & Systems £1.65, and Compliance & Safety £1.77. This comprises £10.29 in OPEX and £2.57 in amortized CAPEX over a 5-year lifespan, based on 22,100 annual missions.

*Source: §7.3 ABC Approach Executive Costing Summary.*`
  },

  {
    id: "d-phase-1-setup",
    category: "Cost",
    chip: "Phase 1 Setup cost and activities",
    question: "What does Phase 1 (Setup) cost and cover?",
    answer: `Phase 1: Setup runs Months 1–3 and costs **£248,840**. Key activities include fleet purchase, infrastructure build, BCAA registration, operator training, and system integration. This represents the bulk of upfront CapEx investment before operations commence.

*Source: §7.5 Cost distribution by phase.*`
  },

  {
    id: "d-phase-2-pilot",
    category: "Cost",
    chip: "Phase 2 Pilot Operations cost",
    question: "What does Phase 2 (Pilot Operations) cost and cover?",
    answer: `Phase 2: Pilot Operations runs Months 4–6 and costs **£56,860**. Key activities include initial test missions, trialing of systems, safety validation, and staff competency verification. This phase ensures readiness before scaling to full operations.

*Source: §7.5 Cost distribution by phase.*`
  },

  {
    id: "d-phase-3-full-ops",
    category: "Cost",
    chip: "Phase 3 Full Operations annual cost",
    question: "What does Phase 3 (Full Operations) cost annually?",
    answer: `Phase 3: Full Operations begins Month 6+ at an ongoing cost of **£227,441/year**. Key activities include ongoing mission delivery, maintenance, and compliance audits. This recurring OPEX matches the total annual operational expenditure across all five activity categories.

*Source: §7.5 Cost distribution by phase.*`
  },

  {
    id: "d-operator-supervisor-pay",
    category: "Cost",
    chip: "Drone operator and supervisor wages",
    question: "How are drone operators paid (£15,360/yr) and supervisors?",
    answer: `Bahrain petroleum workers average 650 BHD (£1,280) monthly. Drone operators earn **£15,360 annually**, derived from this local wage benchmark. Supervisors earn **1.2x** that rate on an arbitrary basis, reflecting their additional oversight responsibilities.

*Source: §7.2 ABC Approach Key Project Metrics and Assumptions.*`
  },

  {
    id: "d-five-year-categories",
    category: "Cost",
    chip: "5-year cost breakdown by category",
    question: "What's the 5-year category breakdown (Personnel/Hardware/Ops/IT/Compliance)?",
    answer: `Over 5 years: Personnel & Training **£558,960 (42.1%)**, Hardware Assets **£122,150 (9.2%)**, Operations & Maintenance **£270,842 (20.4%)**, Technology & IT **£182,000 (13.7%)**, and Compliance & Safety **£195,230 (14.7%)**. Personnel dominates due to recurring OPEX of £110,592/year, while Hardware is purely CapEx (£122,150).

*Source: §7.4 Cost Breakdown By Category And Cost Drivers, Table 15.*`
  },

  {
    id: "d-economic-viability",
    category: "Cost",
    chip: "Why £12.86/mission is economically viable",
    question: "Why is £12.86/mission considered economically viable?",
    answer: `The ABC analysis yields a total cost of **£12.86 per delivery mission**, comprising £10.29 in OPEX and £2.57 in amortized CAPEX over a 5-year lifespan. Based on 22,100 annual missions, this demonstrates the economic viability of drone delivery compared to traditional manual methods. The low per-mission cost is enabled by high fleet utilization (1,326 operational hours annually) across 20 operational drones.

*Source: §7.3 ABC Approach Executive Costing Summary.*`
  },

  {
    id: "e-order-of-precedence",
    category: "Contract",
    chip: "Order of precedence (clause 1)",
    question: "If the Statement of Work and the supplier proposal disagree, which document wins?",
    answer: `Clause 1 fixes a strict **order of precedence** so contradictions between contract documents are resolved deterministically:

1. **Signed Contract and Change Orders**
2. **Statement of Work (SoW)**
3. **Acceptance Test Plan**
4. **Project Requirements tables**
5. **Supplier proposal**

So if the SoW says one thing and the Supplier proposal says another, the **SoW wins**. Only the signed Contract (with any Change Orders) sits above it. The clause also defines two key terms: **SAT** = Site Acceptance Test, **FAT** = Field Acceptance Test.

*Source: §10 Project Contract — clause 1 (Order of precedence and key terms).*`
  },

  {
    id: "e-fat-vs-sat",
    category: "Contract",
    chip: "FAT vs SAT difference",
    question: "What is the difference between FAT and SAT?",
    answer: `Acceptance is **staged** in two steps (clauses 1 and 7):

| Test | Full name | Where it happens | Triggers |
|------|-----------|-----------------|----------|
| **FAT** | Field Acceptance Test | At the **Supplier facility** | Releases the **20%** payment milestone |
| **SAT** | Site Acceptance Test | On **Bapco site** | Starts the 30-day Pilot Period; releases **25%** after pilot pass; starts the **warranty clock**; activates the **24/7 incident channel** and the **≥99.5% SLA** |

Bapco has **10 business days** after each test to accept or issue a revision list, and **one re-test per phase is included at no cost**.

*Source: §10 Project Contract — clauses 1 & 7 (Acceptance testing and test artefacts).*`
  },

  {
    id: "e-comms-framework",
    category: "Contract",
    chip: "Weekly / monthly / 24/7 comms (clause 2)",
    question: "How are project meetings and communications structured under the contract?",
    answer: `Clause 2 sets a three-layer **communication framework**:

- **Weekly project meeting** — Supplier PM and Bapco PM (operational level).
- **Monthly steering meeting** — senior level (strategic oversight).
- **24/7 incident channel** — active **from SAT onwards**.

All key decisions are recorded in **meeting minutes forwarded to both parties within 48 hours**, and **formal notices are issued by email** to the main contacts.

*Source: §10 Project Contract — clause 2 (Contract governance and communication framework).*`
  },

  {
    id: "e-scope-baseline",
    category: "Contract",
    chip: "Scope baseline & out-of-scope rule (clause 3)",
    question: "What happens if Bapco asks for something that is not listed in the Statement of Work?",
    answer: `Clause 3 establishes the **scope baseline**. The Supplier must deliver everything in the SoW, including:

- Hardware
- Embedded firmware
- Ground systems
- Integration services

Anything not explicitly defined is **out of scope unless added via a Change Order**. So a new request from Bapco that isn't in the SoW must go through clause 6's **Change Request** process (with affected requirement IDs, cost, lead time, and risk updates) and receive a **signed Change Order from the project manager** before any work begins.

*Source: §10 Project Contract — clause 3 (Scope of work and deliverables baseline).*`
  },

  {
    id: "e-rolling-plan-slippage",
    category: "Contract",
    chip: "Rolling 3-week plan & slippage notice (clause 4)",
    question: "How early must the Supplier warn Bapco about a delay?",
    answer: `Under clause 4, the Supplier must:

- Deliver milestones aligned with the **approved Gantt chart**.
- Provide a **rolling 3-week plan each week**.
- Notify any **anticipated slippage at least 10 business days before the impacted milestone**.

The slippage notification must include the **root cause**, a **recovery plan**, and the **revised critical path**. This means Bapco gets a two-week-plus warning rather than learning about a delay on the milestone date itself.

*Source: §10 Project Contract — clause 4 (Delivery schedule and milestone integrity).*`
  },

  {
    id: "e-pilot-period",
    category: "Contract",
    chip: "30-day Pilot Period conditions (clause 8)",
    question: "What does the system have to demonstrate during the 30-day Pilot Period?",
    answer: `Clause 8 defines the **Pilot Period** that follows SAT. Across the **30-day** window the system must demonstrate **all** of:

- **≥95% mission success**
- **Zero unresolved Severity-1 safety defects**
- **Documented compliance evidence**

If any condition fails, the Supplier must produce a **remedial action plan within 5 working days**, and the **Pilot Period restarts at Supplier cost**. Successful completion releases the **25% payment** linked to SAT pass / pilot achievement (clause 5).

*Source: §10 Project Contract — clause 8 (Pilot Period performance conditions).*`
  },

  {
    id: "e-support-tiers",
    category: "Contract",
    chip: "L1 / L2 / L3 support tiers (clause 12)",
    question: "What support tiers must the Supplier provide?",
    answer: `Clause 12 defines a tiered **maintenance and support** model:

- **L1 / L2 — remote support.** Handles basic queries and escalates to in-depth engineering support.
- **L3 — engineering support on demand.** Deep technical investigation and fixes.

Additionally, the Supplier must:

- Provide a **preventive maintenance schedule and checklists before SAT**.
- Include **mandatory maintenance in project cost estimates** (so it cannot be billed later as a surprise).

*Source: §10 Project Contract — clause 12 (Maintenance and support obligations).*`
  },

  {
    id: "e-incident-timing",
    category: "Contract",
    chip: "Incident reporting 30s / 4h / 5d (clause 13)",
    question: "How quickly must a drone crash or near-miss be reported and analysed?",
    answer: `Clause 13 requires a **24/7 incident process from SAT** and three escalating reporting deadlines. Any **crash, near-miss, geofence breach, or unplanned landing** triggers:

| Stage | Deadline | Output |
|-------|----------|--------|
| Immediate notification | **Within 30 seconds** | Real-time report of the event |
| Preliminary report | **Within 4 hours** | Automated preliminary report |
| Root cause | **Within 5 business days** | Full Root Cause Analysis (RCA) |

The 30-second clock is tight by design — drones operate inside a refinery, so any deviation must reach Bapco safety teams essentially in real time.

*Source: §10 Project Contract — clause 13 (Incident management and safety event response).*`
  },

  {
    id: "e-warranty-start-replacement",
    category: "Contract",
    chip: "Warranty start at SAT & 14-day rule (clause 11)",
    question: "When does the warranty start, and what if a repair takes too long?",
    answer: `Clause 11 ties warranty timing to acceptance and adds a **no-downtime guarantee** for long repairs:

- **Warranty start date: SAT acceptance** (not delivery, not FAT).
- **Drones:** 24 months **or** 3,000 flight-hours (whichever first).
- **Batteries:** 12 months **or** 500 cycles, with **≥80% capacity retention**.
- **Software:** patched for the SLA duration.

If a repair **exceeds 14 business days**, the Supplier must provide **field-repairable item access, off-site repairs, or temporary replacements free of charge** — Bapco is never left without working hardware while the Supplier diagnoses an item.

*Source: §10 Project Contract — clause 11 (Warranty and spares).*`
  },

  {
    id: "e-confidentiality-survives",
    category: "Contract",
    chip: "Confidentiality survives indefinitely (clause 17)",
    question: "How long does the supplier have to keep Bapco information confidential after the contract ends?",
    answer: `Under clause 17, confidentiality is **perpetual**:

- Client information is treated as confidential and used **only for contract purposes**.
- The obligation **survives indefinitely post-termination** — there is no expiry date.
- The Supplier **cannot publish case studies or press releases referencing Bapco** without **prior written consent**.

So even decades after the contract ends, the Supplier still cannot use Bapco's name in marketing or disclose project information.

*Source: §10 Project Contract — clause 17 (Confidentiality and publicity restriction).*`
  },

  {
    id: "e-rfp-scoring-legend",
    category: "RFP",
    chip: "RFP scoring legend Y / EC / ES / NC / N",
    question: "How are supplier responses scored in the RFP?",
    answer: `§9.1 defines a **weighted scoring scheme** designed to prevent a supplier from winning by sacrificing quality. Each answer is given a code from Table 24 and translated to a numeric score:

| Code | Meaning | Score |
|------|---------|------|
| **Y** | Yes — clear and will be delivered | **3** |
| **EC** | Extra Cost — deliverable but at additional cost | **2** |
| **ES** | Extra System — would require an additional system | **1** |
| **NC** | Not Clear — Bapco supplies more info | **0** |
| **N** | No — supplier will not deliver | **1** *(report's stated value)* |
| **OR** | Overlapping or Redundant | Case-by-case |

Scores are then **multiplied by criticality and confidence level** to produce a **weighted score**. Any **Enhancement costs** are summed and added to the proposal budget. The winning bid **maximises total weighted score while minimising cost**.

*Source: §9.1 Project RFP — Purpose and vendor scope; Table 24 RFP Answer Types.*`
  },

  {
    id: "e-alternative-approaches",
    category: "RFP",
    chip: "Why suppliers may propose alternatives",
    question: "Can a supplier propose an approach that differs from what the RFP describes?",
    answer: `Yes. §9.1 explicitly invites alternatives, with conditions:

> *"Suppliers may propose alternative approaches where these improve performance, reduce risk, or reduce lifecycle cost, provided that all critical requirements are met and any deviations clearly flagged."*

The mechanics in §9.2 reinforce this: any deviation must be **explicitly described in the Comments column** of the conformance table and **priced in Enhancement cost** if applicable. This lets Bapco still compare like-for-like via the weighted scoring while benefiting from supplier expertise and innovation.

*Source: §9.1 Project RFP — Purpose and vendor scope; §9.2 Supplier Response Instructions.*`
  },

  {
    id: "e-implementation-requirements",
    category: "RFP",
    chip: "IR1-IR8 implementation requirements",
    question: "What are the eight Implementation Requirements (IR1-IR8) that the supplier must meet?",
    answer: `Table 25 in §9.2 lists **eight Implementation Requirements** that go beyond functional features and shape *how* the system is delivered and run:

| ID | Requirement |
|----|-------------|
| **IR1** | Operator training programme and competency sign-off |
| **IR2** | Integration with existing Bapco IT infrastructure |
| **IR3** | On-board edge computing for AI-driven autonomy |
| **IR4** | AI-based anomaly detection with external verification |
| **IR5** | Data storage in accordance with **Bahrain data protection legislation** |
| **IR6** | Physical security of drone bases to **ISO 27001:2022** |
| **IR7** | Routine maintenance intervals **≥200 flight hours or 3 months** |
| **IR8** | Operational hours aligned with the **refinery operating schedule** |

Each is scored using the Y/N/NC/EC/ES/OR legend with criticality and confidence weights.

*Source: §9.2 RFP — Table 25 Implementation Requirements (IR1-IR8).*`
  },

  {
    id: "e-supplier-bankruptcy-escrow",
    category: "Contract",
    chip: "Source code escrow on supplier insolvency",
    question: "What happens to the software if the supplier goes bankrupt?",
    answer: `Clause 19 protects Bapco against supplier failure via **mandatory source code escrow**:

- All software developed **specifically for Bapco** must be deposited with an **independent escrow agent**.
- The escrow is **updated at each release**, so it never goes stale.
- The escrow agent **releases the source code** to Bapco in any of three trigger events:
  1. **Supplier insolvency**
  2. **Cessation of support**
  3. **Unremedied material breach unresolved for more than 60 days**

Combined with clause 18 (perpetual, royalty-free, irrevocable licence on hardware and documentation) and clause 16 (all operational data is Bapco property), Bapco can keep operating the drone fleet even if the Supplier disappears.

*Source: §10 Project Contract — clause 19 (Source code escrow for project software).*`
  },

  {
    id: "e-payment-holdback",
    category: "Contract",
    chip: "How much money is held back?",
    question: "How much of the contract value is held back until the very end?",
    answer: `Clause 5 ties payments to **objective deliverables**, with the bulk back-loaded:

| Trigger | % of contract |
|---------|---------------|
| Signature | **10%** |
| PDR (Preliminary Design Review) sign-off | **15%** |
| Hardware delivery | **20%** |
| **FAT pass** | **20%** |
| **SAT pass + 30-day Pilot Period at ≥95% mission success** | **25%** |
| Pilot programme completion | **10%** |

So **35% of the contract value is held back until after SAT** (the 25% SAT+pilot tranche plus the final 10% on pilot completion). Only **45%** is paid before any hardware reaches Bapco's site, which keeps strong commercial pressure on the Supplier to land acceptance cleanly.

*Source: §10 Project Contract — clause 5 (Payment schedule, holdbacks, and acceptance linkage).*`
  },

  {
    id: "f-fr-01-payload",
    category: "Requirements",
    chip: "FR1 — Payload capacity (>=2.0 kg)",
    question: "What does FR1 specify for payload capacity, and how is it rated?",
    answer: `**FR1 — Payload Capacity** sets the lifting requirement for the delivery drone.

- **Threshold:** Must carry **>=2.0 kg payload** (assumption) including the sealed sample box.
- **Criticality:** 6
- **Compliance:** 7
- **Rationale:** The 2.0 kg figure is an assumed envelope that covers a sealed refinery sample box plus minor margin; the moderate criticality (6) reflects that payload is dimensioning but not life-safety critical, while the higher compliance score (7) shows confidence that off-the-shelf airframes can meet it.

*Source: §2.2 — FR1.*`
  },

  {
    id: "f-fr-02-range",
    category: "Requirements",
    chip: "FR2 — Range (2.5 x 2 km, >=20% SoC reserve)",
    question: "What range envelope and battery reserve does FR2 require?",
    answer: `**FR2 — Range** defines the operating envelope across the BAPCO refinery.

- **Threshold:** Complete any point-to-point mission within a **2.5 km x 2 km operating envelope** with **>=20% SoC reserve** on landing.
- **Criticality:** 9
- **Compliance:** 3
- **Why the low compliance:** Maintaining a 20% State-of-Charge reserve across the full envelope under wind/payload load is hard for COTS drones; the criticality of 9 reflects that range failure means a stranded/lost aircraft over hazardous infrastructure.

*Source: §2.2 — FR2.*`
  },

  {
    id: "f-fr-04-manual-override",
    category: "Requirements",
    chip: "FR4 — Manual override (<=2 s latency)",
    question: "How does FR4 define manual override, and why is the latency budget 2 s?",
    answer: `**FR4 — Manual Override** ensures the operator can always reclaim authority.

- **Threshold:** Operator can assume control / command land within **<=2 s command latency**.
- **Criticality:** 9
- **Compliance:** 5
- **Why 2 s:** It is a human-factors bound — long enough to be achievable over a refinery RF link with hand-off, short enough that an operator can intercept an emerging hazard (e.g. drift toward a stack) before it propagates. The 9/5 split shows it is safety-critical but only moderately easy to verify end-to-end.

*Source: §2.2 — FR4.*`
  },

  {
    id: "f-fr-08-wind",
    category: "Requirements",
    chip: "FR8 — Wind resistance (10 m/s)",
    question: "What wind threshold does FR8 assume, and how is it expressed?",
    answer: `**FR8 — Wind Resistance** governs go/no-go decisions at launch.

- **Threshold:** Launch permitted up to a defined wind threshold (**assumption: 10 m/s**) with stable flight; the threshold must be documented.
- **Criticality:** 6
- **Compliance:** 5
- **Notes:** 10 m/s (~36 km/h, ~Beaufort 5) is a typical envelope for sub-25 kg multirotors and aligns with refinery met-mast data. The requirement is *parametric*: the actual figure must be recorded so weather-API checks (FR19) can gate launches against it.

*Source: §2.2 — FR8.*`
  },

  {
    id: "f-fr-11-charging",
    category: "Requirements",
    chip: "FR11 — Charging (80% in 45 min OR swap <=5 min)",
    question: "What turnaround options does FR11 allow for recharging or swapping batteries?",
    answer: `**FR11 — Charging Speed** offers two acceptable approaches:

1. **Fast charge:** Recharge to **>=80% in <=45 min** (assumption), OR
2. **Battery swap:** Battery swap time **<=5 min**.

The selected approach must be documented.

- **Criticality:** 6
- **Compliance:** 5
- **Trade-off:** Fast charge minimises hardware/handling but stresses cells and the dock; swap maximises throughput but requires multiple battery SKUs, charging racks, and a safe handling SOP. Either is acceptable provided the chosen path is documented and tested.

*Source: §2.2 — FR11.*`
  },

  {
    id: "f-fr-12-payload-integrity",
    category: "Requirements",
    chip: "FR12 — Payload integrity (<=15 deg C change)",
    question: "What does FR12 require for payload integrity in transit?",
    answer: `**FR12 — Payload Integrity** protects refinery samples from in-flight degradation.

- **Threshold:** Payload must be **intact upon arrival** with **less than 15 deg C of temperature change** from dispatch to delivery.
- **Criticality:** 9
- **Compliance:** 5
- **Why it matters at BAPCO:** Hydrocarbon samples for lab analysis (octane, sulphur, vapour pressure) can shift composition with thermal load; bounding the delta to <15 deg C keeps results within lab acceptance bands. Insulated/sealed sample boxes plus short flight times are the typical means of compliance.

*Source: §2.2 — FR12.*`
  },

  {
    id: "f-fr-13-collision",
    category: "Requirements",
    chip: "FR13 — Collision prevention",
    question: "How is collision prevention specified and verified under FR13?",
    answer: `**FR13 — Collision Prevention** is one of only two FRs scored 9 on *both* criticality and compliance.

- **Threshold:** Function **demonstrable via simulation or workflow prototype**; acceptance evidence captured.
- **Criticality:** 9
- **Compliance:** 9
- **Reading the scores:** A 9/9 means the team considers this both safety-critical and highly verifiable — modern obstacle-avoidance stacks (stereo, LiDAR, time-of-flight) plus simulation harnesses can produce the acceptance evidence the FR demands. Logged simulation runs and prototype walk-throughs are the expected artefacts.

*Source: §2.2 — FR13.*`
  },

  {
    id: "f-fr-17-geofencing",
    category: "Requirements",
    chip: "FR17 — Geofencing (criticality 9 vs conformance 5)",
    question: "Why is FR17 geofencing rated criticality 9 but conformance only 5?",
    answer: `**FR17 — Geofencing** carries a high-criticality, mid-compliance profile.

- **Threshold:** Drone **cannot exit predefined boundary**; attempts are **logged** and flight is **aborted if near limit**.
- **Criticality:** **9** — at a live hydrocarbon refinery, breaching a boundary into a flare, restricted process unit, or neighbouring airspace is potentially catastrophic (fire, regulatory breach, loss of operating licence). Hence the maximum-tier rating.
- **Conformance:** **5** — the gap reflects real-world implementation difficulty:
  1. GPS drift and multipath near tall steel structures can push reported position outside true position by several metres.
  2. "Abort if near limit" requires a tuned hysteresis band — too tight causes nuisance aborts, too loose lets the drone cross.
  3. Logging + tamper-evident audit of attempts adds software complexity beyond the flight controller.
- **Take-away:** The 9/5 split is honest engineering — the team is saying "we *must* get this right, but we can only confidently claim partial conformance until field trials and the audit pipeline are proven."

*Source: §2.2 — FR17.*`
  },

  {
    id: "f-fr-22-estop",
    category: "Requirements",
    chip: "FR22 — Emergency stop",
    question: "What does FR22 require for the emergency-stop command?",
    answer: `**FR22 — Emergency Stop Command** is the operator's last-resort control.

- **Threshold:** Operator can send an **E-stop signal**, triggering an **immediate controlled descent and land**.
- **Criticality:** 9
- **Compliance:** 5
- **Design note:** "Controlled descent" — not motor cut-off — is deliberate: at refinery altitudes, killing motors over process equipment would create a falling-object hazard worse than the original fault. The E-stop therefore commands a deterministic descent profile to the nearest safe area, consistent with the geofence (FR17) and landing-zone safety check (FR23).

*Source: §2.2 — FR22.*`
  },

  {
    id: "f-fr-25-preflight",
    category: "Requirements",
    chip: "FR25 — Automated pre-flight check",
    question: "What does FR25 require for automated pre-flight checks before drone launch?",
    answer: `**FR25 — Automated pre-flight check** mandates that the system run an automated **health checklist** prior to every launch.

**Items verified:**
- **Battery** state of charge and health
- **GPS lock** acquisition
- **Motor status**

**Gating behaviour:**
- **Launch is blocked** if any critical failure is detected — there is no manual override at this stage.

This guarantees that no drone leaves the dock with a known-bad subsystem, which is essential inside a refinery environment.

*Source: §2.2 — FR25.*`
  },

  {
    id: "f-fr-27-status-broadcast",
    category: "Requirements",
    chip: "FR27 — Status broadcast every <=5 s",
    question: "How frequently must drones broadcast position and status under FR27?",
    answer: `**FR27 — Status update broadcast** requires each drone to transmit its **position and status every \`≤5 s\`**.

**Key points:**
- Cadence threshold: **\`≤5 s\`** between updates.
- Any **interruption** in the broadcast stream is **logged** for later audit.
- This feeds the live tracking GUI (FR28) and the immutable mission log (FR32).

The tight cadence ensures operators can react quickly to a stalled or off-course drone over the BAPCO refinery footprint.

*Source: §2.2 — FR27.*`
  },

  {
    id: "f-fr-28-tracking-telemetry",
    category: "Requirements",
    chip: "FR28 — Real-time tracking & telemetry",
    question: "What information does the FR28 real-time tracking GUI surface, and at what refresh rate?",
    answer: `**FR28 — Real-time tracking and telemetry** specifies that the GUI display key drone state with a **\`≤5 s\` refresh**.

**Fields shown in the GUI:**
- **Drone location**
- **Status**
- **State of Charge (SoC)**
- **Mission phase**
- **ETA**

**Refresh threshold:** \`≤5 s\`, matching the FR27 broadcast cadence so the operator view never lags behind the drone.

*Source: §2.2 — FR28.*`
  },

  {
    id: "f-fr-30-landing-precision",
    category: "Requirements",
    chip: "FR30 — Landing precision <=1.0 m",
    question: "What landing precision target does FR30 set for the autonomous drones?",
    answer: `**FR30 — Landing precision** sets a **conceptual target** for how accurately the drone lands on its marked pad.

**Threshold:**
- The drone shall land on the marked pad **within \`≤1.0 m\`** under nominal conditions.

**Caveats:**
- Quoted as a **conceptual target** — to be refined during prototyping.
- Applies under **nominal** (non-degraded) weather/wind conditions; weather gating is handled separately by FR36.

*Source: §2.2 — FR30.*`
  },

  {
    id: "f-fr-32-audit-log",
    category: "Requirements",
    chip: "FR32 — Immutable mission audit log",
    question: "What does FR32 require the mission audit log to contain, and why must it be immutable?",
    answer: `**FR32 — Mission audit log** requires every mission to produce an **immutable** record.

**Mandatory log fields:**
- **Mission ID**
- **Route**
- **Times** (launch, waypoint, land)
- **Confirmations** (e.g., delivery handshake)
- **Anomalies**

**Why immutable:** the log is the system of record for incident review, regulator queries, and BAPCO HSE investigations — any post-hoc edit would invalidate it as evidence. Pairs naturally with the FR27 status stream as the persistence layer.

*Source: §2.2 — FR32.*`
  },

  {
    id: "f-fr-35-obstacle-avoidance",
    category: "Requirements",
    chip: "FR35 — Obstacle avoidance (baseline)",
    question: "How does FR35 scope obstacle avoidance for the BAPCO drone fleet?",
    answer: `**FR35 — Obstacle avoidance (baseline)** distinguishes between two tiers of avoidance:

**In scope (baseline):**
- The system maintains separation from **known obstacles** using **mapped keep-out volumes** (e.g., flare stacks, process columns).

**Out of scope for the baseline build (future scope):**
- **Dynamic avoidance** of unmapped or moving obstacles is **documented as future scope** rather than delivered initially.

This staged approach keeps the first deployment tractable while leaving a clear upgrade path for sense-and-avoid capability.

*Source: §2.2 — FR35.*`
  },

  {
    id: "f-fr-37-secure-latch",
    category: "Requirements",
    chip: "FR37 — Authenticated payload latch",
    question: "How does FR37 secure the payload during flight and at the delivery point?",
    answer: `**FR37 — Secure payload latch mechanism** governs the physical custody of the sample.

**In-flight behaviour:**
- The payload latch **remains locked** for the entire flight.

**At the delivery point:**
- Unlocking requires an **authenticated command** — the latch will not open from a tamper, a drop, or a spoofed signal.

This protects sample integrity (chain of custody for lab samples) and prevents unauthorised retrieval anywhere along the route inside the refinery.

*Source: §2.2 — FR37.*`
  },

  {
    id: "f-fr-38-fleet-scalability",
    category: "Requirements",
    chip: "FR38 — Fleet scalability",
    question: "How does FR38 ensure the architecture can scale to additional drones?",
    answer: `**FR38 — Fleet scalability (X no. drones)** requires the architecture to grow without redesign.

**Architectural guarantees:**
- New drones can be added with **separate IDs**.
- Each drone supports **independent mission assignment**.

**Implication:** mission queues, telemetry channels (FR27), and audit logs (FR32) must all key on drone ID rather than assume a fixed unit count, so BAPCO can grow the fleet over time as demand warrants.

*Source: §2.2 — FR38.*`
  },

  {
    id: "f-fr-40-continuous-use",
    category: "Requirements",
    chip: "FR40 — Continuous-use operating model",
    question: "What operating model does FR40 define for day-to-day drone operations?",
    answer: `**FR40 — Continuous-use operating model** defines how the service runs in steady state.

**Operating concept includes:**
- **Daily operation** (continuous service rather than ad-hoc sorties).
- **Scheduled maintenance windows** for planned downtime.
- A defined **fault escalation path** so issues route to the right engineer/team without delay.

This requirement is the bridge between the technical FRs and the contractual support obligations (e.g., 24/7 support in the CR table).

*Source: §2.2 — FR40.*`
  },

  {
    id: "g-nfr-overview",
    category: "Requirements",
    chip: "NFRs: what they cover at a high level",
    question: "What are the Non-Functional Requirements (NFRs) and what do they cover?",
    answer: `**Non-Functional Requirements (NFRs)** describe *how* the autonomous drone-delivery system must behave, rather than *what* features it provides. In our specification (Table 2) the NFRs span the cross-cutting qualities that BAPCO needs from any compliant solution:

- **Regulatory & legal**: drone registration with the Bahrain CAA (NFR1), legal mass limits (NFR6), ATEX/refinery safety compliance (NFR9).
- **Reliability & service life**: ≥5-year service life or ≥6,500 cycles (NFR2), fail-safe autonomous landing (NFR3), environmental tolerance for 10–50 °C and <90 % humidity (NFR10).
- **Operability & supportability**: GUI for mission control and monitoring (NFR8), abundant spare parts with ≤4-week lead time (NFR4), 6-month on-site spares stock (NFR11), minimal disruption to refinery operations (NFR5).
- **Security**: cybersecurity threat model with auth, encryption and logging (NFR7).

Each NFR carries a **Criticality** and **Complexity** score so suppliers can be assessed objectively, and each row links back to the Risk Analysis (§8) where relevant.

*Source: §2.2 / §12.2 — NFR1–NFR11.*`
  },

  {
    id: "g-nfr3-failsafe-landing",
    category: "Requirements",
    chip: "NFR3 — Fail-safe autonomous landing",
    question: "Walk me through NFR3 — the fail-safe landing requirement.",
    answer: `**NFR3 — Fail-safe landing** is one of the highest-criticality NFRs (criticality 9, complexity 6) because it directly protects refinery personnel and assets if a drone loses link, power or controllability inside BAPCO.

- **What it mandates**: the drone *must* land safely and autonomously in any of the emergency situations enumerated in the **Risk Analysis (§8)** — e.g. lost C2 link, low battery, GPS denial, motor failure, geofence breach.
- **Why it matters here**: BAPCO is an operating refinery; an uncontrolled descent over process units could cause ATEX ignition, pipe damage or injury, so a deterministic safe-landing behaviour is non-negotiable.
- **How a supplier evidences it**: pre-defined emergency-landing zones, redundant IMU/GPS, automated return-to-home with battery-aware path planning, and demonstrated flight-test logs of triggered failsafes.
- **Couples to**: NFR9 (ATEX safe standoff) and NFR7 (cyber events that may also force a landing).

*Source: §2.2 / §12.2 — NFR3.*`
  },

  {
    id: "g-nfr7-cybersecurity",
    category: "Requirements",
    chip: "NFR7 — Cybersecurity risks mitigated",
    question: "Walk me through NFR7 — the cybersecurity NFR.",
    answer: `**NFR7 — Cybersecurity risks mitigated** addresses the threat surface of an autonomous, network-connected drone fleet operating inside an OT environment.

- **Mandate**: the supplier must produce a **threat model** for the drone, ground station and data pipeline, and implement at minimum the following controls:
  1. **Authentication** — strong identity for operators, drones and back-end services.
  2. **Encryption** — in transit (C2, telemetry, video) and at rest (mission logs, imagery).
  3. **Logging** — tamper-evident audit trails to support incident response.
- **Criticality / complexity**: 9 / 5 — high impact, moderate to deliver because the building blocks (TLS, mTLS, signed firmware, SIEM ingestion) are well understood.
- **Reads across to**: **IR2** (integration with BAPCO IT), **IR5** (Bahrain data-protection law), and **IR6** (ISO 27001:2022 physical security of drone bases) — together they form the security envelope.

*Source: §2.2 / §12.2 — NFR7.*`
  },

  {
    id: "g-ir1-operator-training",
    category: "Requirements",
    chip: "IR1 — Operator training programme",
    question: "What does IR1 require for the operator training programme?",
    answer: `**IR1 — Operator training programme and competency sign-off** (criticality 6, complexity 6) ensures that BAPCO personnel can safely run the drone service from day one.

- **Scope of training**:
  - Pre-flight checks, mission planning in the GUI (ties to NFR8) and post-flight logging.
  - Emergency procedures including manual override and the NFR3 fail-safe landing flow.
  - ATEX/refinery-specific operating constraints (NFR9) and exclusion-zone handling.
  - Cyber-hygiene for ground-station accounts (links to NFR7).
- **Competency sign-off**: each operator is formally assessed and signed off before being allowed solo operations; records are retained for audit.
- **Commercial dimension** in the RFP: supplier specifies *who delivers* training (Bapco, Supplier, or 3rd party), **cost**, and whether a **demo is needed (Yes / No / Partial)**.

*Source: §9.2, Table 25 — IR1.*`
  },

  {
    id: "g-ir2-it-integration",
    category: "Requirements",
    chip: "IR2 — Integration with existing BAPCO IT",
    question: "How does IR2 govern integration with existing BAPCO IT infrastructure?",
    answer: `**IR2 — Integration with existing Bapco IT infrastructure** (criticality 6, complexity 7 — the *highest complexity* in the IR table) recognises that the drone system cannot be a silo.

- **What needs integrating**:
  - **Identity & access**: SSO / Active Directory for operator log-in to the ground station.
  - **Maintenance & asset systems**: feeds from inspection flights into BAPCO's CMMS / work-order system.
  - **Data lakes / historians**: telemetry and anomaly detections (IR4) consumed alongside existing process data.
  - **Network segmentation**: drone C2 sits in an appropriately segmented zone so it does not bridge IT and OT improperly.
- **Why complexity is 7**: each integration crosses an organisational boundary, requires BAPCO IT change-management approval, and must respect existing security baselines.
- **Supplier responsibility split** is captured in the RFP "Ownership" column — Bapco, Supplier, or 3rd Party.

*Source: §9.2, Table 25 — IR2.*`
  },

  {
    id: "g-ir3-edge-computing",
    category: "Requirements",
    chip: "IR3 — On-board edge computing",
    question: "What does IR3 specify about on-board edge computing for AI-driven autonomy?",
    answer: `**IR3 — On-board edge computing for AI-driven autonomy** (criticality 6, complexity 5) requires the drone to carry sufficient compute to make safety-critical decisions locally rather than relying on a round-trip to a cloud or ground server.

- **Capabilities to be hosted at the edge**:
  - Real-time perception (obstacle and personnel detection).
  - Path-planning and geofence enforcement.
  - First-pass anomaly detection feeding **IR4** (with external verification downstream).
  - Failsafe state machine for **NFR3** landings.
- **Why edge and not cloud**:
  - **Latency**: refinery flight envelopes leave no time for a cloud round-trip.
  - **Resilience**: drone must remain safe if RF link degrades.
  - **Bandwidth**: only summarised events/imagery are uplinked, easing the IR2 integration load.
- **Supplier disclosure** in the RFP: target SoC, TOPS budget, model-update mechanism and signed-firmware story (links to NFR7).

*Source: §9.2, Table 25 — IR3.*`
  },

  {
    id: "g-ir5-bahrain-data-law",
    category: "Requirements",
    chip: "IR5 — Bahrain data protection legislation",
    question: "How does IR5 address Bahrain data protection legislation?",
    answer: `**IR5 — Data storage in accordance with Bahrain data protection legislation** (criticality 6, complexity 5) ensures that any personal data captured by drones — for example faces in inspection imagery or operator account data — is handled lawfully under **Bahrain's Personal Data Protection Law (PDPL, Law No. 30 of 2018)**.

- **Practical controls expected from the supplier**:
  - **Data residency** — primary storage of personal data within Bahrain unless a lawful transfer mechanism exists.
  - **Lawful basis & minimisation** — only capture/retain data needed for inspection and safety.
  - **Subject rights workflow** — access, rectification and deletion requests can be honoured.
  - **Retention schedule** with automated purge.
  - **Breach-notification process** aligned with PDPL timelines.
- **Couples to**: NFR7 (encryption, logging) and IR6 (physical security of the bases that host the data).

*Source: §9.2, Table 25 — IR5.*`
  },

  {
    id: "g-ir6-iso27001-physical",
    category: "Requirements",
    chip: "IR6 — Physical security to ISO 27001:2022",
    question: "What does IR6 require for physical security of the drone bases?",
    answer: `**IR6 — Physical security of drone bases to ISO 27001:2022** (criticality 9, complexity 5 — the *highest-criticality* IR) extends the cyber controls of NFR7 into the physical world.

- **Reference standard**: **ISO/IEC 27001:2022**, in particular the *Annex A controls in the "Physical" theme* (A.7.1–A.7.14), covering:
  - Secure perimeters and physical entry controls for drone hangars / charging pads.
  - Protection against environmental threats (heat, dust, ATEX zone considerations).
  - Equipment siting, secure disposal, and clear-desk/clear-screen for ground stations.
  - Cabling and supporting-utilities security.
- **Operational expectations**:
  - Tamper-evident enclosures for drones at rest.
  - Logged badge access and CCTV coverage of the base.
  - Documented procedures for maintenance visitors, aligned with IR7 maintenance windows.
- **Why criticality 9**: a compromised base could allow firmware tampering or theft of an asset that is then flown over live process units.

*Source: §9.2, Table 25 — IR6.*`
  },

  {
    id: "g-ir7-maintenance-interval",
    category: "Requirements",
    chip: "IR7 — Maintenance every 200 hr / 3 months",
    question: "What does IR7 specify about routine maintenance intervals?",
    answer: `**IR7 — Routine maintenance intervals ≥200 flight hours or 3 months** (criticality 6, complexity 5) sets a *minimum* preventive-maintenance cadence so that drones remain airworthy throughout the NFR2 service life.

- **The rule** — whichever comes *first*:
  - **≥200 flight hours** of cumulative airtime, **or**
  - **3 calendar months** since the last service.
- **Typical scope of a service**: motor/ESC inspection, propeller replacement, battery health check and recalibration, IMU/GPS calibration, firmware and security-patch update (ties to NFR7), structural inspection for ATEX-relevant damage (NFR9).
- **Why two triggers**: low-utilisation drones still degrade calendar-wise (battery chemistry, seal aging in Bahrain humidity per NFR10), while heavily flown drones reach wear thresholds before 3 months elapse.
- **Scheduling**: maintenance windows should be planned against **IR8** so that downtime aligns with refinery operating schedules and spares draw on the NFR4 / NFR11 stock.

*Source: §9.2, Table 25 — IR7.*`
  },

  {
    id: "h-bcaa-role",
    category: "Regulatory",
    chip: "BCAA role in approvals",
    question: "What is BCAA and what is its role here?",
    answer: `**BCAA** is the **Bahrain Civil Aviation Affairs**, the national authority that regulates unmanned aerial systems (UAS) and grants flight approvals — including BVLOS (Beyond Visual Line of Sight) operations.

Its role in this project:

- **Approval gatekeeper:** All drone deliveries at the BAPCO refinery require BCAA authorisation before flight.
- **Risk driver:** Civil aviation approval delays are logged in Risk Category E (Risk #1) with a probability of 3 and impact of 5 (RPN = 15), classified as a *Regulatory* risk that would cause **deployment delay**.
- **Mitigation:** The team commits to **early engagement with BCAA** to secure airspace approvals before deployment, and Clause 14 obliges the Supplier to comply with Bahrain CAA rules for unmanned aerial systems and telecoms constraints.

*Source: §8.5 Risk Category E (Table 21, Risk #1) and §10 Clause 14.*`
  },

  {
    id: "h-bvlos-illegal",
    category: "Regulatory",
    chip: "BVLOS legality in Bahrain",
    question: "Why is BVLOS flight illegal in Bahrain without approval?",
    answer: `BVLOS (Beyond Visual Line of Sight) flights are not permitted by default in Bahrain because the **BCAA (Bahrain Civil Aviation Affairs)** must explicitly authorise unmanned operations that go beyond standard visual range.

Key points from the report:

- **Clause 14 (Regulatory and site compliance)** requires the Supplier to comply with **Bahrain CAA rules for unmanned aerial systems** and applicable telecoms constraints — flights outside those rules are non-compliant.
- **Risk Category E (Risk #1)** identifies *civil aviation approval delays* as a high-RPN regulatory risk (RPN = 15) because operations cannot legally start without sign-off.
- **Mitigation:** Early engagement with BCAA is required to secure BVLOS approval, plus telecoms-spectrum clearance for the C2 link.

Without BCAA approval, any BVLOS sortie at BAPCO would breach Bahraini aviation law and trigger an immediate safety shutdown.

*Source: §8.5 Risk Category E (Risk #1) and §10 Clause 14.*`
  },

  {
    id: "h-atex-certification",
    category: "Regulatory",
    chip: "ATEX certification in hazardous zones",
    question: "What is ATEX certification and why is it needed?",
    answer: `**ATEX** is the European certification scheme for equipment used in **explosive atmospheres** (named after the French *ATmosphères EXplosibles* directives). It demonstrates that a device cannot ignite flammable vapours, gases, or dust.

Why it matters at BAPCO:

- The refinery contains **hazardous zones** with hydrocarbon vapours; any electrical or electronic equipment flown into those zones must be ignition-safe.
- **Clause 14** requires the Supplier to provide **certified compliance evidence (e.g. ATEX certification)** wherever hazardous-area constraints apply, or otherwise enforce a documented **safe-standoff geofence**.
- **Risk Category E (Risk #2)** lists *ATEX certification delay* with P=3, I=5, **RPN = 15**, classified as *Compliance*. The operational impact is **inability to operate in hazardous zones**.
- **Mitigation:** Pre-certification testing is performed before deployment so that ATEX evidence is in hand by SAT.

*Source: §8.5 Risk Category E (Risk #2) and §10 Clause 14.*`
  },

  {
    id: "h-hse-non-compliance",
    category: "Regulatory",
    chip: "HSE non-compliance risk",
    question: "What is HSE non-compliance risk?",
    answer: `**HSE** stands for **Health, Safety, and Environment** — the operational rule set governing how work is conducted at the BAPCO refinery.

The report flags HSE non-compliance as Risk #3 in Risk Category E:

- **Probability:** 2
- **Impact:** 5
- **RPN:** 10
- **Type:** Compliance
- **Operational impact:** **Safety shutdown** — refinery operators can halt drone activities if procedures are not followed.
- **Mitigation:** Routine **safety audits** of drone operating procedures to ensure ongoing alignment with refinery HSE standards.

In practice this means drone procedures (pre-flight checks, hazardous-zone handling, emergency landings) must mirror BAPCO's existing HSE documentation, or the project loses its licence to operate on-site.

*Source: §8.5 Risk Category E (Risk #3).*`
  },

  {
    id: "h-ptw-alignment",
    category: "Regulatory",
    chip: "Permit-To-Work alignment",
    question: "What is the Permit-To-Work (PTW) process and how does the project align?",
    answer: `A **Permit-To-Work (PTW)** is the formal authorisation system used at refineries to control hazardous activities — each task requires a written permit listing controls, isolations, and time windows before work can start.

Project alignment:

- **Risk Category E (Risk #6)** identifies *misalignment with permit-to-work procedures* with P=3, I=4, **RPN = 12**, type *Compliance*.
- **Operational impact:** Operational delays and flight restrictions if drone missions clash with active PTWs (e.g. hot work, confined-space entry).
- **Mitigation:** **Align drone operations with the existing PTW process** — every mission is checked against the active permit register so that drones do not enter areas with conflicting permits, and drone activity itself is captured under the PTW system.

This ensures BAPCO's safety controllers retain a single source of truth for who is doing what, where, and when across the site.

*Source: §8.5 Risk Category E (Risk #6).*`
  },

  {
    id: "h-data-residency-bahrain",
    category: "Regulatory",
    chip: "Bahrain data residency",
    question: "Why must operational data stay in Bahrain (Clause 16)?",
    answer: `Clause 16 of the Project Contract — *Data ownership, residency, and portability* — restricts where operational data may be stored or transferred.

Key requirements:

- **Bapco ownership:** All operational data (**flight logs, telemetry, maintenance records, mission history**) is Bapco property.
- **Residency:** Data **shall not be transferred outside Bahrain without written authorisation**, in line with Bahraini data-protection legislation and refinery confidentiality.
- **Portability:** Supplier-held data must be exportable in **non-proprietary formats within 15 business days** upon request or termination, at no extra cost.

Keeping data inside Bahrain protects against foreign legal exposure, satisfies the Personal Data Protection Law, and maintains BAPCO's control over commercially sensitive refinery information.

*Source: §10 Clause 16.*`
  },

  {
    id: "h-data-protection-ir5",
    category: "Regulatory",
    chip: "Bahrain data protection (IR5)",
    question: "How does the project comply with Bahrain data protection law (IR5)?",
    answer: `Information Requirement **IR5** mandates *"Data storage in accordance with Bahrain data protection legislation"* (criticality 6, complexity 5).

Compliance approach:

- **In-country hosting:** Operational data is stored on infrastructure physically located in Bahrain, satisfying the residency rule of Clause 16.
- **Risk #4 (Data retention non-compliance)** is mitigated by **secure local hosting** (RPN = 8, type Compliance), preventing regulatory penalties.
- **Access controls:** Aligned with the ISO 27001 controls under IR6/Clause 15 so that personal and operational data is protected end-to-end.
- **Cross-border transfers:** Forbidden without **written authorisation**, mirroring the consent and adequacy requirements of Bahrain's Personal Data Protection Law.

Combined, IR5 + Clause 16 give BAPCO a defensible, auditable trail showing data protection law has been observed.

*Source: §10 Project Requirements IR5 and Clause 16; §8.5 Risk Category E (Risk #4).*`
  },

  {
    id: "h-iso-27001-controls",
    category: "Regulatory",
    chip: "ISO 27001 controls (IR6, Clause 15)",
    question: "What ISO 27001 controls apply (Clause 15, IR6)?",
    answer: `The project anchors its cybersecurity posture in **ISO 27001:2022** through two artefacts:

- **IR6 — Physical security of drone bases to ISO 27001:2022** (criticality 9, complexity 5): drone hangars, charging pads, and ground-control rooms must apply ISO 27001 physical-security controls (access control, surveillance, environmental protection, asset handling).
- **Clause 15 — Cybersecurity and secure-by-design controls:** the Supplier's implementation must **align with ISO 27001**, covering logical access, encryption, secure development, and incident response.
- **Breach reporting:** Suspected or confirmed breaches must be reported within **24 hours**, with **containment action initiated upon detection**.

Together these implement Annex A controls across physical (A.7), access (A.5/A.8), operations (A.8), and incident-management (A.5.24-30) domains.

*Source: §10 Project Requirement IR6 and Clause 15.*`
  },

  {
    id: "h-insurance-gaps",
    category: "Regulatory",
    chip: "Insurance coverage gaps",
    question: "How are insurance coverage gaps handled?",
    answer: `**Risk Category E (Risk #5)** identifies *insurance coverage gaps* as a Legal risk:

- **Probability:** 2
- **Impact:** 4
- **RPN:** 8
- **Type:** Legal
- **Operational impact:** **Financial exposure** — uncovered third-party damage, cargo loss, or hull loss would fall on the Supplier or BAPCO directly.

Mitigation strategy: secure **contract protection clauses** that bind the Supplier to maintain adequate aviation, public-liability, cargo, and cyber-incident insurance for the full lifecycle, with named-insured rights for BAPCO and certificates renewed before expiry.

This supplements the indemnity language (e.g. Clause 18 IP indemnity) so BAPCO is not left bearing financial risk that should sit with the Supplier or its insurer.

*Source: §8.5 Risk Category E (Risk #5).*`
  },

  {
    id: "h-data-retention-compliance",
    category: "Regulatory",
    chip: "Data retention compliance",
    question: "How does the project handle data retention compliance?",
    answer: `Data retention is treated as a Compliance risk and is controlled through layered safeguards:

- **Risk #4 — Data retention non-compliance** (P=2, I=4, **RPN = 8**, type Compliance). Operational impact: **regulatory penalties**. Mitigation: **secure local hosting** keeps data inside Bahrain for the legally required retention window.
- **Clause 16 (Data ownership, residency, portability):** flight logs, telemetry, maintenance records, and mission history are owned by BAPCO and exportable in non-proprietary formats within **15 business days** of request or termination — guaranteeing the client can satisfy any audit or retention demand.
- **IR5:** Storage practices follow Bahrain data-protection legislation, including retention periods aligned with the Personal Data Protection Law.
- **IR6 / Clause 15:** ISO 27001 controls cover secure deletion, backup integrity, and access logging across the retention lifecycle.

*Source: §8.5 Risk Category E (Risk #4); §10 Clause 16, IR5, IR6, Clause 15.*`
  },

  {
    id: "risk-strategic-misalignment-bapco",
    category: "Risk",
    chip: "Strategic risk: misalignment with BAPCO priorities",
    question: "What is the risk of misalignment with BAPCO operational priorities and KPIs?",
    answer: `Misalignment with BAPCO operational priorities and KPIs is a strategic risk that can lead to misaligned system functionality and underutilisation of the drone fleet. It is mitigated through consistent reviews, KPI alignment meetings, and a signed CONOPS.

**P=2, I=5, RPN=10**

*Source: §8.1 — Risk #A1.*`
  },

  {
    id: "risk-strategic-scope-expansion",
    category: "Risk",
    chip: "Strategic risk: scope expansion during pilot/rollout",
    question: "How does scope expansion during the pilot and rollout phase impact the project?",
    answer: `Expansion of project scope during pilot and rollout is a strategic risk that causes delays in deployment, increased costs, and resource overload. It is mitigated through a formal change control process requiring approval.

**P=3, I=4, RPN=12**

*Source: §8.1 — Risk #A2.*`
  },

  {
    id: "risk-strategic-roi-failure",
    category: "Risk",
    chip: "Strategic risk: failure to demonstrate ROI",
    question: "What happens if the project fails to demonstrate ROI after deployment?",
    answer: `Failure to demonstrate ROI after deployment is a strategic risk that can reduce executive support and risk project discontinuation. Mitigation requires defining clear performance KPIs before launch and comparing results post-implementation.

**P=3, I=4, RPN=12**

*Source: §8.1 — Risk #A3.*`
  },

  {
    id: "risk-technical-comms-link-loss",
    category: "Risk",
    chip: "Technical risk: communication link loss in flight",
    question: "What is the impact of communication link loss during a drone mission?",
    answer: `Communication link loss during mission is a technical risk causing interrupted missions and delayed deliveries. The mitigation is dual communication channels to ensure resilience.

**P=3, I=4, RPN=12**

*Source: §8.2 — Risk #B4.*`
  },

  {
    id: "risk-technical-software-regression",
    category: "Risk",
    chip: "Technical risk: software update regression",
    question: "How does a software update introducing regression affect the fleet?",
    answer: `A software update that introduces regression is a technical risk causing system instability across the fleet. Mitigation includes staged rollout and rollback capability to recover quickly from faulty updates.

**P=3, I=4, RPN=12**

*Source: §8.2 — Risk #B6.*`
  },

  {
    id: "risk-technical-supplier-delays",
    category: "Risk",
    chip: "Technical risk: supplier delays for critical components",
    question: "What is the risk of supplier delays for critical drone components?",
    answer: `Supplier delays for critical components are a technical risk that result in deployment delays. Mitigation relies on multi-sourcing and maintaining buffer stock of essential parts.

**P=3, I=3, RPN=9**

*Source: §8.2 — Risk #B8.*`
  },

  {
    id: "risk-ai-model-drift",
    category: "Risk",
    chip: "AI risk: model drift reducing detection accuracy",
    question: "How does model drift affect the AI obstacle detection system?",
    answer: `Model drift reducing detection accuracy is a technical AI risk that lowers obstacle detection reliability over time. It is mitigated through scheduled retraining and validation of the perception models.

**P=3, I=4, RPN=12**

*Source: §8.3 — Risk #C1.*`
  },

  {
    id: "risk-ai-false-positives",
    category: "Risk",
    chip: "AI risk: excess false positives causing aborts",
    question: "What is the impact of excess false positives in obstacle detection?",
    answer: `Excess false positives causing aborts is a technical AI risk leading to unnecessary mission interruptions. The mitigation strategy is detection-threshold tuning and rigorous testing.

**P=3, I=3, RPN=9**

*Source: §8.3 — Risk #C3.*`
  },

  {
    id: "risk-ai-cyberattack-control",
    category: "Risk",
    chip: "Security risk: cyberattack on drone control",
    question: "What is the risk of a cyberattack on the drone control system?",
    answer: `A cyberattack on the drone control system is a security risk causing operational disruption to the autonomous fleet. Mitigation is implemented through encrypted communications between drones and ground control.

**P=2, I=5, RPN=10**

*Source: §8.3 — Risk #C5.*`
  },

  {
    id: "risk-ai-low-explainability",
    category: "Risk",
    chip: "AI risk: low explainability reduces operator trust",
    question: "How does low AI explainability affect operator trust?",
    answer: `Low explainability of AI decisions is an organisational risk that reduces operator trust in the autonomous system, hindering adoption and oversight. Addressing it requires building interpretable model outputs and transparent decision logs.

**P=3, I=3, RPN=9**

*Source: §8.3 — Risk #C8.*`
  },

  {
    id: "i-d1-collision-refinery-infrastructure",
    category: "Risk",
    chip: "D1: Collision with refinery infrastructure",
    question: "What is the risk of drone collision with refinery infrastructure (D1)?",
    answer: `Risk D1 covers drones colliding with refinery infrastructure (towers, pipework, flares), causing damage to assets and operational disruption.

**P=2, I=5, RPN=10** (Safety).

Mitigation: *Geofencing and avoidance systems* to keep drones clear of fixed assets.

*Source: §8.4 — Risk #D1.*`
  },

  {
    id: "i-d2-battery-fire",
    category: "Risk",
    chip: "D2: Battery fire during operation or charging",
    question: "How is the risk of a battery fire during operation or charging (D2) handled?",
    answer: `Risk D2 addresses Li-ion battery fires occurring in flight or while charging, which would trigger a safety incident and fleet shutdown.

**P=2, I=5, RPN=10** (Safety).

Mitigation: *Certified charging and fire controls* to contain thermal events.

*Source: §8.4 — Risk #D2.*`
  },

  {
    id: "i-d3-emergency-landing-restricted-zone",
    category: "Risk",
    chip: "D3: Emergency landing in restricted zone",
    question: "What if a drone has to make an emergency landing in a restricted zone (D3)?",
    answer: `Risk D3 covers an unplanned emergency landing inside a restricted refinery area, which would cause a temporary area shutdown.

**P=2, I=5, RPN=10** (Safety).

Mitigation: *Pre-defined safe landing areas* designated across the BAPCO site.

*Source: §8.4 — Risk #D3.*`
  },

  {
    id: "i-d7-operator-error-mission-planning",
    category: "Risk",
    chip: "D7: Operator error in mission planning",
    question: "How is operator error in mission planning (D7) mitigated?",
    answer: `Risk D7 covers human error during mission planning that leads to incorrect routing or mission abort.

**P=3, I=4, RPN=12** (Human).

Mitigation: *SOPs and validation checks* applied before each flight.

*Source: §8.4 — Risk #D7.*`
  },

  {
    id: "i-e3-hse-non-compliance",
    category: "Risk",
    chip: "E3: HSE non-compliance in procedures",
    question: "What is the risk of HSE non-compliance in procedures (E3)?",
    answer: `Risk E3 covers drone procedures failing to meet HSE standards, which would trigger a safety shutdown.

**P=2, I=5, RPN=10** (Compli.).

Mitigation: *Safety audits* run on a regular cadence.

*Source: §8.5 — Risk #E3.*`
  },

  {
    id: "i-e5-insurance-coverage-gaps",
    category: "Risk",
    chip: "E5: Insurance coverage gaps",
    question: "How are insurance coverage gaps (E5) addressed?",
    answer: `Risk E5 covers gaps in insurance coverage for drone operations, exposing Valthr and BAPCO to financial loss after an incident.

**P=2, I=4, RPN=8** (Legal).

Mitigation: *Contract protection clauses* embedded in operator and vendor agreements.

*Source: §8.5 — Risk #E5.*`
  },

  {
    id: "i-e6-misalignment-ptw",
    category: "Risk",
    chip: "E6: Misalignment with permit-to-work procedures",
    question: "What is the risk of misalignment with permit-to-work (PTW) procedures (E6)?",
    answer: `Risk E6 covers drone operations that do not align with BAPCO's permit-to-work process, causing operational delays and flight restrictions.

**P=3, I=4, RPN=12** (Compli.).

Mitigation: *Align drone operations with existing PTW process*.

*Source: §8.5 — Risk #E6.*`
  },

  {
    id: "i-f1-capex-overrun",
    category: "Risk",
    chip: "F1: CAPEX overrun",
    question: "How is the CAPEX overrun risk (F1) controlled?",
    answer: `Risk F1 covers capital expenditure exceeding plan, leading to budget pressure and scope reduction.

**P=3, I=4, RPN=12** (Financial).

Mitigation: *Per-stage cost control* applied across the rollout.

*Source: §8.6 — Risk #F1.*`
  },

  {
    id: "i-f2-opex-underestimated",
    category: "Risk",
    chip: "F2: OPEX underestimated",
    question: "What if operating expenditure is underestimated (F2)?",
    answer: `Risk F2 covers OPEX being set too low at planning, undermining the long-term sustainability of the drone programme.

**P=3, I=4, RPN=12** (Financial).

Mitigation: *Lifecycle cost review* to recalibrate run-rate assumptions.

*Source: §8.6 — Risk #F2.*`
  },

  {
    id: "i-f3-vendor-lock-in",
    category: "Risk",
    chip: "F3: Vendor lock-in",
    question: "How is vendor lock-in (F3) mitigated?",
    answer: `Risk F3 covers over-dependence on a single drone or platform vendor, reducing flexibility and raising future costs.

**P=3, I=3, RPN=9** (Comm.).

Mitigation: *Open standards and exit clauses* written into supplier contracts.

*Source: §8.6 — Risk #F3.*`
  },

  {
    id: "j-prince2",
    category: "Glossary",
    chip: "What is PRINCE2?",
    question: "What is PRINCE2 / PRINCE2 7 and how does the report use it?",
    answer: `**Definition:** PRINCE2 (Projects IN Controlled Environments) is a structured, stage-gated project management methodology with defined roles, products, and tolerances; PRINCE2 7 is the 2023 refresh with improved Agile integration and digital reporting.

**In this report:** Valthr evaluated PRINCE2 7 in Section 5 as a candidate methodology but rejected it as too document-heavy for a 6-month PoC, although its Risk Register concept was retained.

*Source: §5 (Table 6, PRINCE2 Management methodology).*`
  },

  {
    id: "j-agile-scrum",
    category: "Glossary",
    chip: "What is Agile-Scrum?",
    question: "What is Agile-Scrum and how does the report use it?",
    answer: `**Definition:** Agile-Scrum is an iterative project management framework using short sprints (typically 2 weeks), a Scrum Master, product backlog, and daily stand-ups to deliver incremental value.

**In this report:** Valthr selected Agile-Scrum as the project management methodology because it best fits the iterative, exploratory nature of the BAPCO drone PoC, with ~2-week sprints and a digital Kanban board.

*Source: §5 (Table 7, Agile-Scrum management methodology).*`
  },

  {
    id: "j-spiral-vmodel",
    category: "Glossary",
    chip: "What is the Spiral model?",
    question: "What is the Spiral model (with V-model) and how does the report use it?",
    answer: `**Definition:** The Spiral model is a risk-driven software development lifecycle where each loop covers planning, risk analysis, engineering, and evaluation; the V-model pairs each development phase with a corresponding verification/validation activity.

**In this report:** Valthr chose the Spiral model for its risk-driven emphasis on autonomous drone safety and integrated V-model principles into prototyping and simulation phases to maximise verification rigour.

*Source: §5 (Table 10, Spiral Methodology).*`
  },

  {
    id: "j-wbs",
    category: "Glossary",
    chip: "What is a WBS?",
    question: "What is a Work Breakdown Structure (WBS) and how does the report use it?",
    answer: `**Definition:** A WBS is a deliverable-oriented hierarchical decomposition of project work into manageable packages, ensuring 100% scope coverage without duplication.

**In this report:** Section 3 presents the PoC WBS with rationale and diagram, grouping co-located requirements such as geofencing under operational definition packages.

*Source: §3 (WBS rationale and diagram).*`
  },

  {
    id: "j-critical-path",
    category: "Glossary",
    chip: "What is the Critical Path?",
    question: "What is Critical Path Analysis and how does the report use it?",
    answer: `**Definition:** The critical path is the longest sequence of dependent activities through a project schedule; tasks on it have zero float, so any delay slips the whole project.

**In this report:** Section 4.1's Critical Path Diagram (Figure 7) identifies week 22 (integration and commissioning) as the key convergence point where setup and regulatory streams feed in, making it the highest-risk milestone.

*Source: §4.1 Critical Path Analysis.*`
  },

  {
    id: "j-moscow",
    category: "Glossary",
    chip: "What is MoSCoW?",
    question: "What is MoSCoW prioritisation and how does the report use it?",
    answer: `**Definition:** MoSCoW classifies requirements into Must-have, Should-have, Could-have, and Won't-have categories to focus delivery on what is truly essential.

**In this report:** Valthr applied MoSCoW to BAPCO's stated requirements (gathered via the email thread in Appendix 15) to triage scope for the PoC.

*Source: §2 (Requirements engineering).*`
  },

  {
    id: "j-abc",
    category: "Glossary",
    chip: "What is Activity-Based Costing?",
    question: "What is Activity-Based Costing (ABC) and how does the report use it?",
    answer: `**Definition:** ABC assigns costs to activities and then to outputs based on actual resource consumption, often using time-driven operational rates for more accurate unit economics than traditional overhead allocation.

**In this report:** Section 7 uses time-driven ABC to derive a total cost of £12.86 per delivery mission (£10.29 OPEX + CAPEX amortisation), with the full breakdown in Appendix 11.

*Source: §7 and §11 (Full Activity-Based Costing).*`
  },

  {
    id: "j-rpn",
    category: "Glossary",
    chip: "What is RPN?",
    question: "What is Risk Priority Number (RPN) and how does the report use it?",
    answer: `**Definition:** RPN is a risk-ranking score computed by multiplying Possibility (P) by Criticality/Impact (I), used to prioritise mitigation and escalation.

**In this report:** The risk register scores P and I from 1–5 and computes RPN = P x I across Organisational, Compliance, Regulatory and other categories to rank mitigations.

*Source: §6 Risk scoring.*`
  },

  {
    id: "j-apriltag",
    category: "Glossary",
    chip: "What are AprilTags?",
    question: "What are AprilTag fiducial markers and how does the report use them?",
    answer: `**Definition:** AprilTags are 2D fiducial markers (similar to QR codes) detectable by a camera, providing precise relative pose estimation for robotics.

**In this report:** A downward-facing camera detects AprilTags to achieve precise landing accuracy, which is why high-precision GPS RTK was deemed unnecessary (standard ~5m GPS suffices for cruise).

*Source: §4 (Drone navigation/landing).*`
  },

  {
    id: "j-floyd-warshall",
    category: "Glossary",
    chip: "What is Floyd-Warshall?",
    question: "What is the Floyd-Warshall algorithm and how does the report use it?",
    answer: `**Definition:** Floyd-Warshall is a dynamic-programming algorithm that computes shortest paths between all pairs of nodes in a weighted graph in O(n^3) time.

**In this report:** The fleet management system pre-computes all-pairs shortest paths via Floyd-Warshall at initialisation, enabling fast route assignment to drones during operation (Figure 9).

*Source: §4 (Fleet management system).*`
  },

  {
    id: "k-lab-sample-end-to-end",
    category: "Operations",
    chip: "Lab sample delivery walkthrough",
    question: "Walk through a typical lab-sample delivery end-to-end.",
    answer: `A technician submits a lab-sample delivery request from a rugged on-site tablet or office computer, viewing queued deliveries, ETAs, and drone status. The request is transmitted to the cloud or on-site edge server, which runs fleet optimisation and assigns a route to a specific drone. The route plan is uploaded to the drone via the Wi-Fi mesh network covering predefined air corridors between the nine stations. The drone flies autonomously using GPS (~5 m accuracy) along corridors generated by the Floyd-Warshall shortest-path computation, with onboard forward-facing cameras providing local obstacle avoidance. On approach, a downward-facing camera detects an AprilTag fiducial marker at the destination station to achieve centimetre-level landing precision. The sample is offloaded and the drone awaits its next assignment from the optimiser.

*Source: §1.2, §5.1, §5.2.*`
  },

  {
    id: "k-emergency-ppe-delivery",
    category: "Operations",
    chip: "Emergency PPE deployment",
    question: "Describe an emergency PPE delivery scenario.",
    answer: `When safety equipment is urgently needed, the request is flagged high-priority and submitted via tablet or computer. The optimiser dispatches the nearest available (or soon-to-be-available) drone using the pre-computed shortest path between the nine stations, rather than inserting the task into an existing route. The drone navigates via the Wi-Fi-mesh-covered air corridors using GPS, with onboard obstacle avoidance handling short-range adjustments in real time. Intrinsically safe components allow operation in hazardous refinery zones, and AprilTag-based landing ensures precise drop-off near the incident location. This shortcut path minimises response time compared with manual transport across the 2.5 x 2 km site.

*Source: §1.2, §5.1, §5.2.*`
  },

  {
    id: "k-tools-spare-parts",
    category: "Operations",
    chip: "Tools and spare-parts transport",
    question: "Describe a tools/spare-parts transport scenario.",
    answer: `An operator submits a tools or spare-parts request from a tablet or computer, which is routed to the cloud/edge optimiser. Because such tasks are typically lower priority, the optimiser evaluates all drones in the fleet of 20 and inserts the delivery into the route causing the smallest additional distance, improving overall fleet efficiency. The assigned drone collects the payload from its current micro-base station and flies along predefined air corridors between the relevant nodes (e.g. Fabrication Workshop to Central Refinery). GPS handles navigation, AprilTags handle landing, and onboard cameras manage local obstacle avoidance. The drone returns to the network and continues serving queued tasks.

*Source: §1.2, §5.2.*`
  },

  {
    id: "k-low-battery-mid-mission",
    category: "Operations",
    chip: "Low battery mid-mission handling",
    question: "What happens when a drone's battery is low mid-mission?",
    answer: `Battery status is one of the inputs the AI-driven dispatch platform uses when allocating tasks, so the optimiser tracks state of charge in real time. When charging is required, the fleet optimiser routes the drone to a wireless charging dock at one of the micro-base stations. Charging occurs autonomously without manual battery replacement, increasing system autonomy. The optimiser can then reassign pending work to other available drones to maintain service continuity.

*Source: §1.2, §5.1.*`
  },

  {
    id: "k-weather-abort",
    category: "Operations",
    chip: "Weather-triggered abort behaviour",
    question: "What happens during a weather-triggered abort?",
    answer: `The system design incorporates automated fail-safe protocols alongside intrinsically safe components, geofencing, and redundant communications. When conditions exceed safe limits, these fail-safes engage to protect the drone and surroundings. The report does not specify the detailed weather-abort procedure beyond the existence of these fail-safe protocols and the constraint that drones operate only within predefined air corridors.

*Source: §1.2, §5.1.*`
  },

  {
    id: "k-gps-degradation",
    category: "Operations",
    chip: "GPS degradation in refinery structures",
    question: "What happens if GPS signal degrades in refinery structures?",
    answer: `Navigation relies primarily on GPS providing roughly 5 m accuracy, which was deemed sufficient because landing precision is delivered separately by AprilTag fiducial markers detected via a downward-facing camera. Local obstacle avoidance is handled onboard using forward-facing cameras feeding the onboard computer, which calculates short-range path adjustments in real time independent of GPS quality. Redundant communications and automated fail-safe protocols provide additional resilience. High-precision GPS RTK was specifically considered and judged unnecessary given this layered approach.

*Source: §1.2, §5.1.*`
  },

  {
    id: "k-priority-dispatch",
    category: "Operations",
    chip: "High vs low priority dispatch logic",
    question: "How are high-priority vs low-priority deliveries dispatched differently?",
    answer: `For high-priority deliveries, the optimiser dispatches the nearest available (or soon-to-be-available) drone using the pre-computed shortest path from the Floyd-Warshall algorithm, minimising response time. For low-priority deliveries, the optimiser instead evaluates all drones across the fleet and inserts the new task into the route that adds the smallest additional distance, improving overall fleet efficiency. Both modes operate over the same graph of nine stations connected by predefined air corridors.

*Source: §5.2.*`
  },

  {
    id: "k-charging-trigger-routing",
    category: "Operations",
    chip: "Charging trigger and routing",
    question: "How does charging get triggered and routed?",
    answer: `Charging is triggered when battery status, monitored by the dispatch platform, indicates the drone needs power. The fleet optimiser then routes the drone to a wireless charging dock located at the station network. Charging is fully autonomous, occurring without manual battery replacement, which increases system autonomy and supports continuous operation across the 20-drone fleet.

*Source: §1.2, §5.1.*`
  },

  {
    id: "k-request-flow-tablet-to-drone",
    category: "Operations",
    chip: "Request flow tablet to drone",
    question: "How do requests get from a user's tablet to the optimiser to a drone?",
    answer: `Users submit delivery requests from rugged on-site tablets or office computers, where they can also see queued deliveries, ETAs, and drone status. Each request is transmitted to either a cloud server or an on-site edge server, depending on Bapco's infrastructure and cybersecurity policies (edge offers lower latency and WAN-outage resilience; cloud is easier to scale). The server performs fleet optimisation and assigns a route to a specific drone. The chosen route plan is then uploaded to the drone via a Wi-Fi mesh network covering the predefined air corridors. Once airborne, the drone executes the mission autonomously.

*Source: §5.1.*`
  },

  {
    id: "k-continuous-daily-operation",
    category: "Operations",
    chip: "Continuous daily operation support",
    question: "How does the system support continuous (daily) operation including maintenance?",
    answer: `Continuous operation is supported by a fleet of 20 drones distributed across nine micro-base stations, coordinated by an AI-driven dispatch platform that allocates tasks dynamically by priority, payload, battery status, and proximity. Autonomous wireless charging at docks removes the need for manual battery swaps, keeping drones in service. Redundant communications, geofencing within predefined air corridors, and automated fail-safe protocols maintain safe operation in hazardous zones. Future improvements outlined in the report include integrating delivery trucks via a second road-based graph so the system can compare drone and truck availability and pick the most efficient mode. The report does not detail a specific scheduled maintenance procedure beyond these autonomy and reliability features.

*Source: §1.2, §5.1, §5.3.*`
  },

  {
    id: "l-team-composition",
    category: "Team",
    chip: "Who is on the Valthr team",
    question: "Who are the five members of the Valthr group working on the BAPCO drone delivery challenge?",
    answer: `The **Valthr** team (Group 01, MSIN0068) consists of **five UCL students**:

- **Victor Brinzan** (ID 22101125)
- **Rustam Toshov** (ID 23005674)
- **Hugo Valade** (ID 23138182)
- **Lea Dabboussi** (ID 22040217) — primary point of contact for emails to Mr. Basheer
- **Taro Kuroda** (ID 22164098)

The team worked on this 8-week live client challenge for **Bapco Refining**, with a final word count of 2,012 words (excluding tables and references) and a revision date of April 13, 2026.

*Source: Cover page & §15 Appendix 5.*`
  },

  {
    id: "l-mendelow-matrix",
    category: "Stakeholders",
    chip: "Mendelow internal vs external map",
    question: "How was the Mendelow stakeholder power-interest map structured for the BAPCO drone project?",
    answer: `The team drafted a **Mendelow's Matrix** (Figure 1) collaboratively as the foundation of stakeholder analysis:

- **Internal stakeholders** are coloured **yellow** on the map.
- **External stakeholders** are coloured **teal**.
- Each stakeholder was assigned a **1–10 score for both Power and Interest**, then plotted on the grid.
- Positions were assigned by **team consensus** after individual research.
- Scores were recorded in a database to drive requirement prioritisation downstream.

The map separates regulators, the client, suppliers, refinery staff, and the public/community so that engagement strategy (manage closely, keep satisfied, keep informed, monitor) is clear for each group.

*Source: §2.1 Stakeholders.*`
  },

  {
    id: "l-bcaa-stakeholder",
    category: "Stakeholders",
    chip: "BCAA — high power regulator",
    question: "How does Bahrain Civil Aviation Affairs (BCAA) feature in the stakeholder analysis?",
    answer: `**Bahrain CAA (BCAA)** is treated as an **external, high-power regulatory stakeholder**:

- **Role:** Issues drone registration, operator training approval, and beyond-visual-line-of-sight (BVLOS) authorisation — without which the system **cannot legally fly** in Bahrain.
- **Power:** Very high — flying drones outside direct line of sight of an operator is illegal in Bahrain without their approval.
- **Interest:** Moderate-to-high — they care about safety precedent in industrial airspace.
- **Risk linkage:** The top regulatory risk in §8 is "Civil aviation approval delays" with mitigation "Early engagement with BCAA".
- **Contract linkage:** Clause 14 obliges the Supplier to comply with **Bahrain CAA rules for unmanned aerial systems**.

*Source: §2.1 Stakeholders & §10 Clause 14.*`
  },

  {
    id: "l-hse-stakeholder",
    category: "Stakeholders",
    chip: "HSE — safety gatekeeper",
    question: "What role does HSE (Health, Safety, Environment) play as a stakeholder?",
    answer: `**HSE** is positioned as an **internal high-power stakeholder** at the BAPCO refinery:

- **Authority:** Can trigger a **safety shutdown** of drone operations if procedures are non-compliant (Risk #3 in the regulatory register: "HSE non-compliance in procedures", RPN 10).
- **Interface:** Drone operations must align with the refinery's **Permit-to-Work (PTW)** process — misalignment is logged as Risk #6 with RPN 12.
- **Engagement:** Mitigation is **safety audits** and PTW alignment workshops.
- **Contractual reach:** Subcontractors (Clause 20) must meet equivalent **confidentiality, HSE, and security** obligations as the prime supplier.

HSE essentially holds veto power over deployment, so they appear in the **high-power / high-interest** quadrant.

*Source: §2.1, §8 Risk Register, §10 Clause 20.*`
  },

  {
    id: "l-bapco-it-stakeholder",
    category: "Stakeholders",
    chip: "BAPCO IT — integration owner",
    question: "How is BAPCO IT classified in the stakeholder map and what is their interest?",
    answer: `**BAPCO IT** is an **internal stakeholder** with high interest in the project's technical integration:

- **Concerns:** System integration with refinery networks, **cybersecurity** posture (Clause 15 mandates ISO 27001 alignment), data residency (Clause 16 requires data stays in Bahrain unless authorised in writing), and identity/access management.
- **Power:** Medium-to-high — they sign off on network access, firewall rules, and on-prem hosting decisions.
- **Interest:** High — operational data (flight logs, telemetry, maintenance records) is **BAPCO property** and they curate it.
- **Engagement:** Receive the audit rights described in Clause 21 (twice-yearly audits, 48-hour post-incident audits).

*Source: §2.1, §10 Clauses 15, 16, 21.*`
  },

  {
    id: "l-refinery-ops-stakeholder",
    category: "Stakeholders",
    chip: "Refinery operators on the ground",
    question: "How are refinery operations and on-the-ground staff treated as stakeholders?",
    answer: `**Refinery operations and field staff** sit in the **internal / high-interest** band of the Mendelow grid:

- **Why high interest:** They are the **end users** receiving sample deliveries; the system directly affects their daily workflow and PPE/permit routine.
- **Power:** Moderate — individual operators can't kill the project, but collective resistance is a documented risk ("Stakeholder resistance", §8).
- **Concerns captured:** Need for **first-aid kits, gas detectors, PPE, and emergency communication devices** at landing pads (Appendix 4 inventory).
- **Engagement:** Pilot Period (Clause 8) requires a **30-day field demonstration** with ≥95% mission success — a deliberate trust-building mechanism for ops staff.

*Source: §2.1, §8 Risks, §10 Clause 8.*`
  },

  {
    id: "l-drone-supplier-stakeholder",
    category: "Stakeholders",
    chip: "Drone supplier as external partner",
    question: "Where does the drone supplier sit on the stakeholder map and what obligations do they carry?",
    answer: `The **drone supplier** is an **external high-power, high-interest** stakeholder — effectively the contract counterparty:

- **Power:** High — they own the platform, firmware, ground systems, and integration know-how (Clause 3 scope).
- **Interest:** High — payment is gated on milestones (10% signature, 15% PDR, 20% hardware, 20% FAT, 25% SAT, 10% pilot completion per Clause 5).
- **Risk exposure:** Subject to **liquidated damages** of 0.5%/week capped at 10% (Clause 22), liability cap at 150% of contract value (Clause 23), and **source-code escrow** (Clause 19).
- **Vendor lock-in** is itself logged as a financial risk (Risk Category F #3), mitigated by **open standards and exit clauses**.

*Source: §2.1, §10 Clauses 3, 5, 19, 22, 23.*`
  },

  {
    id: "l-stakeholder-scoring-method",
    category: "Stakeholders",
    chip: "Consensus-based 1-10 scoring",
    question: "What process did the team use to assign stakeholder power and interest scores?",
    answer: `The team used a **two-stage consensus method** to avoid groupthink:

1. **Individual blind scoring** — each of the five members independently scored every stakeholder on a **1–10 scale** for both power and interest.
2. **Group discussion** — scores were brought together, outliers were debated, and a **team-consensus position** on Mendelow's Matrix was agreed.

The same blind-then-discuss approach was applied to **MoSCoW criticality scoring** for requirements. Final scores were stored in a database that drove the requirements tables and the stakeholder distribution chart (Figure 30).

*Source: §2.1 Stakeholders.*`
  },

  {
    id: "l-basheer-email-outreach",
    category: "Process",
    chip: "Email thread with Mr. Basheer",
    question: "How did the team gather requirements directly from Mr. Basheer at BAPCO?",
    answer: `Requirements were collected through a **structured email exchange** with **Mr. Basheer Isa, Sr. Engineer Instrumentation, Bapco Refining**:

- **Initiator:** Lea Dabboussi sent the opening email on **Thursday, 22 January 2026 at 13:49**, on behalf of Valthr (Group 1).
- **Recipients (Cc):** Angelo Markopoulos (UCL supervisor), Elias Bader (Bapco Refining), and the four other team members.
- **Topics raised:** Project scope and deliverables, assumptions, success criteria, and the **preferred communication pathway** with BAPCO.
- **Mr. Basheer's response:** He clarified that the goal is **not** to build a full drone or AI system, but to deliver a feasible portion fitting the module — offering three directions: (1) High-Level Conceptual & Feasibility Study, (2) Preliminary Mechanical Design, (3) Software-Oriented Concept.
- **Agreed channel:** Email Mr. Basheer directly, copying **Elias Bader** and the UCL supervisor.

*Source: §15 Appendix 5: Email Communications with Bapco.*`
  },

  {
    id: "l-moscow-vs-criticality",
    category: "Process",
    chip: "MoSCoW bands vs 1-10 criticality",
    question: "How does the MoSCoW classification differ from the criticality/complexity scoring?",
    answer: `The team used **two complementary scoring schemes**:

**MoSCoW prioritisation** (qualitative bands, mapped from a 1–10 score):
- **Must** = score **≥ 9**
- **Should** = score **5–8**
- **Could** = score **1–4**
- (Won't = explicitly out of scope)

**Criticality + Complexity** (paired 1–10 scores per requirement):
- **Criticality** captures stakeholder importance / safety impact.
- **Complexity** captures implementation difficulty — a separate axis.
- Both are columns in the requirement tables (FR/NFR/IR/CR/DV).

So MoSCoW is a **derivative band** of the criticality score, while complexity is independent — together they let the team identify high-criticality / low-complexity quick wins versus high-complexity Musts that drive the critical path.

*Source: §2.1 & §2.2 Tables of Requirements.*`
  },

  {
    id: "l-notion-kanban-cadence",
    category: "Process",
    chip: "Notion Kanban + every-other-day stand-ups",
    question: "What sprint cadence and tooling did the team adopt under Agile-Scrum?",
    answer: `Under the chosen **Agile-Scrum** PM methodology, the team operationalised the cadence as follows:

- **Backlog:** A Product Backlog was derived from the Requirements table (§13) to ensure clear user stories.
- **Concurrent sprints:** At least **two concurrent sprints** ran at any time, subject to Scrum Master approval.
- **Tooling:** Progress tracked on a **digital Kanban board in Notion**.
- **Stand-ups:** Meetings held **every other day** (not daily) — a deliberate adaptation for a five-person student team.
- **Reporting:** **Burn-down charts** shared with the team and stakeholders.
- **Closure:** Each sprint ended with testing against verification methods + acceptance criteria, then a stakeholder review.
- **Hybrid additions:** An informal **Lessons Log** and **Risk Register** from PRINCE2 were integrated, plus **ITIL** for cost/budget configuration management.

*Source: §6.1 Selecting Project Management methodology.*`
  },

  {
    id: "l-clause1-order-precedence",
    category: "Process",
    chip: "Contract Clause 1 hierarchy",
    question: "What is the Order of Precedence defined in Clause 1 of the contract?",
    answer: `**Clause 1** of the contract (Table 26) defines the **Order of Precedence** to resolve conflicts between contractual artefacts. From highest to lowest authority:

1. **Signed Contract and Change Orders**
2. **Statement of Work (SoW)**
3. **Acceptance Test Plan**
4. **Project Requirements tables** (FR/NFR/IR/CR/DV)
5. **Supplier proposal**

The clause also defines the key acronyms: **SAT** = Site Acceptance Test, **FAT** = Field/Factory Acceptance Test. This hierarchy ensures that if, say, the supplier's marketing proposal contradicts the signed SoW, the SoW wins — protecting BAPCO from scope drift.

*Source: §10 Project Contract, Clause 1.*`
  },

  {
    id: "l-clause2-comms-framework",
    category: "Process",
    chip: "Weekly / monthly / 24-7 governance",
    question: "What communication framework does Clause 2 establish between the supplier and BAPCO?",
    answer: `**Clause 2** sets out a **three-tier governance and communication structure**:

1. **Weekly project meeting** — between the Supplier PM and the Bapco PM (operational tracking).
2. **Monthly steering meeting** — at senior level (strategic alignment, escalations).
3. **24/7 incident channel** — active **from SAT onwards** for safety and outage events.

Supporting rules:
- **All key decisions** are recorded in **meeting minutes** and forwarded to both parties **within 48 hours**.
- **Formal notices** are issued by **email to the main contacts**.

This mirrors the cadence Mr. Basheer himself confirmed in the Appendix 5 email exchange — emails to him directly, copying Elias Bader and the UCL supervisor.

*Source: §10 Clause 2 & §15 Appendix 5.*`
  },

  {
    id: "l-no-genai-declaration",
    category: "Team",
    chip: "No-GenAI integrity declaration",
    question: "What is the team's declared stance on the use of Generative AI in this report?",
    answer: `On the **cover page** of the report, the Valthr team makes an explicit integrity declaration:

> *"We, as a Team, confirm that we have not used GenAI in preparing our responses to the requirements of this assessment. We recognise that there are significant UCL penalties for making such a statement if it is subsequently found to be false."*

Key implications:
- **All analysis, writing, and figures are human-authored** by the five named team members.
- The declaration is signed-off collectively under all five student IDs.
- It signals to both the UCL marker and to **Mr. Basheer at BAPCO** that the requirements interpretation, stakeholder map, contract clauses, and cost models reflect the team's own engineering judgement — not generated content.

*Source: Cover page declaration.*`
  },

  {
    id: "l-charter-working-hours",
    category: "Team",
    chip: "Group Charter & working-hours pie",
    question: "What does Appendix 4 (Group Charter) record about meetings and workload distribution?",
    answer: `**Appendix 4: Group Charter** documents how the team governed itself:

- **§14.1 Meeting minutes:** Captures notes from **six recorded team meetings** (Figures 36–41: Meeting 1 through Meeting 6 Notes), evidencing the every-other-day cadence in practice.
- **§14.2 Summary of working hours:** A **pie chart (Figure 42)** detailing how much work each of the five members contributed — used to demonstrate equitable workload distribution.

A complementary admission appears in the **Spiral Methodology table (Table 10)**: under Weaknesses, the team frankly notes that risk analysis "*requires expertise in risk analysis and identification. We, as a team, would need to hire someone externally for this role.*" — a candid acknowledgement of capability gaps, consistent with the Charter's transparency culture.

*Source: §14 Appendix 4 & §6.2 Table 10.*`
  },

  {
    id: "m-edge-vs-cloud-server",
    category: "Tradeoffs",
    chip: "Edge server vs cloud server",
    question: "Why does the system support both edge and cloud servers, and which fits BAPCO?",
    answer: `The architecture allows either an edge or cloud server to host fleet optimisation, with the choice depending on BAPCO's infrastructure and cybersecurity policies.

| Option | Strengths | Weaknesses |
|---|---|---|
| Edge server | "Lower latency and continues operating during WAN outages" | Harder to scale; on-site maintenance needed |
| Cloud server | "Easier to scale and maintain" | WAN-dependent; higher latency |

**Chosen:** Both are supported; the report notes "the choice between edge and cloud depends on Bapco's current infrastructure and cybersecurity policies." Edge is favoured for refinery resilience.

*Source: §5.1.*`
  },

  {
    id: "m-rtk-vs-apriltags",
    category: "Tradeoffs",
    chip: "GPS RTK vs basic GPS + AprilTags",
    question: "Why use basic GPS with AprilTags instead of high-precision GPS RTK?",
    answer: `Navigation uses standard GPS (~5 m accuracy) augmented by AprilTag fiducial markers for landing.

| Option | Strengths | Weaknesses |
|---|---|---|
| GPS RTK | Centimetre-level positioning everywhere | Costly base-stations and added complexity |
| Basic GPS + AprilTags | Cheap; "centimetre-level landing precision" via downward camera | Only precise at docks, not en-route |

**Chosen:** Basic GPS + AprilTags, because "high-precision GPS RTK was deemed not required because landing accuracy is achieved using AprilTags." En-route 5 m accuracy is sufficient within predefined air corridors.

*Source: §5.1.*`
  },

  {
    id: "m-floyd-warshall-vs-runtime",
    category: "Tradeoffs",
    chip: "Pre-computed Floyd-Warshall vs runtime paths",
    question: "Why pre-compute paths with Floyd-Warshall instead of computing them at runtime?",
    answer: `The fleet manager pre-computes all-pairs shortest paths once at initialisation.

| Option | Strengths | Weaknesses |
|---|---|---|
| Floyd-Warshall pre-computed | Instant dispatch; deterministic; supports priority + insertion logic | Must rerun if graph weights change |
| Runtime (e.g., Dijkstra per request) | Adapts dynamically | Higher per-request latency; repeated work |

**Chosen:** Floyd-Warshall, since "a Floyd-Warshall algorithm pre-computes shortest paths between all node pairs at initialisation," enabling fast nearest-drone dispatch and least-additional-distance insertion for low-priority jobs.

*Source: §5.2.*`
  },

  {
    id: "m-wireless-charging-vs-battery-swap",
    category: "Tradeoffs",
    chip: "Wireless charging vs battery swap",
    question: "Why pick wireless charging docks over manual battery swapping?",
    answer: `FR11 allows either ">=80% in <=45 min" recharge or "battery swap time <=5 min" — wireless charging was selected.

| Option | Strengths | Weaknesses |
|---|---|---|
| Wireless charging dock | Fully autonomous; "increases system autonomy"; no human handling | Slower top-up time |
| Battery swap | Faster turnaround (<=5 min) | Requires manual intervention or robotic swap rig |

**Chosen:** Wireless charging because "charging occurs autonomously without manual battery replacement. This increases system autonomy," matching the unattended fleet model.

*Source: §5.1, FR11.*`
  },

  {
    id: "m-drone-only-vs-drone-truck",
    category: "Tradeoffs",
    chip: "Drone-only vs combined drone-truck",
    question: "Why deliver by drone only now, with drone-truck integration as a future enhancement?",
    answer: `The current MATLAB optimiser runs a single drone graph; mixed-mode is flagged as a future improvement.

| Option | Strengths | Weaknesses |
|---|---|---|
| Drone-only (current) | Simple; one graph; aligns with payload/range scope | Cannot handle heavier or off-corridor jobs |
| Drone + truck (future) | "Compare drone and truck availability to select the most efficient mode" | Requires second road-based graph and mode-selection logic |

**Chosen:** Drone-only for the deployed MVP; "future improvements may include integrating delivery trucks" via a second road graph weighted by driving time.

*Source: §5.3.*`
  },

  {
    id: "m-prince2-vs-agile-scrum",
    category: "Tradeoffs",
    chip: "PRINCE2 vs Agile-Scrum",
    question: "Why choose Agile-Scrum over PRINCE2 for project management?",
    answer: `Both were evaluated; Agile-Scrum better suits a small team iterating with the CAA and BAPCO.

| Option | Strengths | Weaknesses |
|---|---|---|
| PRINCE2 | Bahrain-standard; clear roles; tolerance gates | "Extensive documentation would likely slow down the progress"; rigid full plan |
| Agile-Scrum | Flexible sprints; customer collaboration central; iterative refinement | Workload stress; documentation can lag |

**Chosen:** Agile-Scrum because "PRINCE2 7 lacks in flexibility... For our five-person team, multiple control levels would be redundant." Sprints support iterative work with Bahrain's CAA, echoing lessons from "incidents involving Amazon Prime Air in the USA."

*Source: §6.1.*`
  },

  {
    id: "m-spiral-vs-incremental",
    category: "Tradeoffs",
    chip: "Spiral vs Incremental Development",
    question: "Why select Spiral over Incremental Development for implementation?",
    answer: `Both fit Agile-Scrum, but Spiral's risk emphasis matters more for a safety-critical drone deployment.

| Option | Strengths | Weaknesses |
|---|---|---|
| Incremental | Sequential Waterfall mini-projects; low initial cost; early features delivered | "Increments can go for months and even years"; management overhead at scale |
| Spiral | "Risk driven... allows for early detection of issues"; integrates with sprints | Costly prototyping; needs risk-analysis expertise |

**Chosen:** Spiral, because "deploying an autonomous drone delivery system in an industrial environment presents significant safety and operational risks," and "Incremental Development model can unnecessarily extend the implementation timeline."

*Source: §6.2.*`
  },

  {
    id: "m-spiral-vs-iterative",
    category: "Tradeoffs",
    chip: "Spiral vs Iterative Enhancement",
    question: "Why select Spiral over Iterative Enhancement?",
    answer: `Iterative Enhancement repeatedly refines a delivered system, but is poorly suited to a from-scratch safety-critical build.

| Option | Strengths | Weaknesses |
|---|---|---|
| Iterative Enhancement | Feedback-driven; flexible re-entry to any stage | "Can become expensive and time-consuming"; oriented to fixing already-delivered projects |
| Spiral | Risk-first; pairs with V-model testing; constant customer feedback | Risk of indefinite spiraling if poorly managed |

**Chosen:** Spiral, since "Iterative Enhancement would introduce excessive cost," whereas Spiral's risk-driven prototyping is essential because flying drones beyond line of sight "is illegal in Bahrain" without rigorous validation.

*Source: §6.2.*`
  },

  {
    id: "m-costs-by-activity-vs-category",
    category: "Tradeoffs",
    chip: "Costs by activity vs by category",
    question: "Why present costs both by activity and by category instead of one view?",
    answer: `The report uses two complementary cost lenses for different audiences.

| Option | Strengths | Weaknesses |
|---|---|---|
| By Activity (ABC) | "Activities support operational management"; assigns £/mission to workflows like Drone Operations | Less useful for strategic resource planning |
| By Category | "Categories inform investment strategy"; aggregates by Personnel, Hardware, Tech | Hides operational mission-level drivers |

**Chosen:** Both — activity-based costing for operations (£12.86/mission), and category breakdown for investors (e.g., Personnel & Training = 42.1% of 5-year total). Each "consume[s] resources" differently, so each lens reveals different cost drivers.

*Source: §7.4.*`
  },

  {
    id: "m-drone-vs-manual-transport",
    category: "Tradeoffs",
    chip: "Drone delivery vs manual transport",
    question: "Why replace BAPCO’s manual transport with autonomous drones?",
    answer: `The status quo relies on people walking/driving samples and tools across a 2.5x2 km hazardous site.

| Option | Strengths | Weaknesses |
|---|---|---|
| Manual transport | Familiar; no new tech investment | "Delays, operational inefficiencies, and unnecessary personnel exposure to hazardous areas" |
| Autonomous drones | Faster, on-demand; £12.86/mission; reduces hazard exposure; supports digital transformation | £191,980 CapEx; regulatory + safety overhead |

**Chosen:** Drones, because ABC analysis "demonstrates the economic viability of drone delivery compared to traditional manual methods," while improving worker safety and refinery efficiency.

*Source: §1.1, §7.3.*`
  },

  {
    id: "stations-list",
    category: "Architecture",
    chip: "List of all 9 drone stations",
    question: "What are the 9 drone stations in the BAPCO network?",
    answer: `The fleet management system uses **9 stations** as graph nodes:

1. Main Building / Cafeteria
2. North-West Refinery
3. North-East Refinery
4. Bapco Water Treatment Plant
5. Bapco Fluid Catalytic Cracking Unit (FCC)
6. Bapco Modernization Programme Building
7. Central Refinery
8. Fabrication Workshop
9. South Refinery

*Source: §5.2.*`
  },

  {
    id: "main-building-cafeteria",
    category: "Architecture",
    chip: "Main Building / Cafeteria role",
    question: "What is at the Main Building / Cafeteria station?",
    answer: `The Main Building / Cafeteria is one of the 9 selected nodes, chosen via Google Maps for available space, proximity to important buildings, and even spatial distribution. The report lists this station but doesn't elaborate on its specific role.

*Source: §5.2.*`
  },

  {
    id: "fcc-station",
    category: "Architecture",
    chip: "FCC unit station rationale",
    question: "What is the FCC station and why include it?",
    answer: `The **Bapco Fluid Catalytic Cracking Unit (FCC)** is one of the 9 nodes. It was selected (alongside the others) using Google Maps based on available space, proximity to important buildings, and even spatial distribution across the refinery. The report lists this station but doesn't elaborate on its specific operational role.

*Source: §5.2.*`
  },

  {
    id: "modernization-programme-building",
    category: "Architecture",
    chip: "Modernization Programme node",
    question: "Why is the Modernization Programme Building a station?",
    answer: `The **Bapco Modernization Programme Building** was included as one of the 9 nodes via the same selection criteria — available space, proximity to important buildings, and even spatial distribution. The report lists this station but doesn't elaborate on its specific role.

*Source: §5.2.*`
  },

  {
    id: "fabrication-workshop",
    category: "Architecture",
    chip: "Fabrication Workshop coverage",
    question: "What does the Fabrication Workshop station serve?",
    answer: `The **Fabrication Workshop** is one of the 9 nodes selected via Google Maps using the criteria of available space, proximity to important buildings, and even spatial distribution. The report lists this station but doesn't elaborate on its specific role.

*Source: §5.2.*`
  },

  {
    id: "sparse-graph-rationale",
    category: "Architecture",
    chip: "Why not all node pairs connect",
    question: "Why are some node pairs not connected in the graph?",
    answer: `Not all node pairs are linked. This deliberate sparsity:

- **Reduces possible flight paths**
- **Simplifies airspace management**

The resulting graph has 17 predefined air corridors across the 9 stations.

*Source: §5.2.*`
  },

  {
    id: "station-selection-method",
    category: "Architecture",
    chip: "How the 9 stations were chosen",
    question: "How were the 9 stations selected?",
    answer: `The team selected stations using **Google Maps**, with three criteria:

1. **Available space** for landing/takeoff
2. **Proximity to important buildings**
3. **Even spatial distribution** across the refinery

*Source: §5.2.*`
  },

  {
    id: "operational-footprint",
    category: "Architecture",
    chip: "BAPCO refinery coverage area",
    question: "What operational footprint does the network cover?",
    answer: `The 9 stations and 17 air corridors span the BAPCO refinery in Bahrain, covering an area on the order of **2.5 × 2 km**. Stations are evenly distributed to provide full-site coverage.

*Source: §5.2.*`
  },

  {
    id: "edge-weights",
    category: "Architecture",
    chip: "Edge weights and modifiability",
    question: "How are edge weights determined and why are they easily modifiable?",
    answer: `Edge weights on the air-corridor graph are based on **geographical (straight-line) distance** between stations.

The report notes these weights "can be easily modified in the future" — for example, swapping in driving time, energy cost, or wind-adjusted travel time — without reworking the underlying graph or the Floyd–Warshall shortest-path computation.

*Source: §5.2.*`
  },

  {
    id: "future-road-graph",
    category: "Architecture",
    chip: "Future expansion to truck network",
    question: "How could the network expand in the future?",
    answer: `Future improvements may **integrate delivery trucks** alongside drones:

- A **second road-based graph** would be built with different weightings
- Weights would reflect **driving time** rather than straight-line distance
- The system could then **compare drone vs truck availability** and pick the most efficient mode per delivery

*Source: §5.3.*`
  },

  {
    id: "o-position-info-operators",
    category: "Operations",
    chip: "Position info shown to operators (FR5 trackability)",
    question: "What position information is shown to operators?",
    answer: `Per **FR5 (trackability)**, operators see each drone's real-time **GPS position** (lat/long), **altitude**, and **heading** on a map overlay of the BAPCO refinery, refreshed at intervals of **≤5 seconds**.

The display also shows the drone's **assigned mission ID**, **current waypoint**, and **distance-to-target**, enabling rapid situational awareness across the fleet.

*Source: §2.2 FR5.*`
  },

  {
    id: "o-status-broadcast-frequency",
    category: "Operations",
    chip: "Drone status broadcast cadence (FR27 ≤5s)",
    question: "How often does each drone broadcast its status?",
    answer: `Under **FR27**, every drone broadcasts a **status packet at least once every 5 seconds** while airborne, including position, battery, and health indicators.

This cadence ensures operators and the central GCS retain near-real-time visibility for safe operations within the refinery's restricted airspace.

*Source: §2.2 FR27.*`
  },

  {
    id: "o-telemetry-gui-contents",
    category: "Operations",
    chip: "Live telemetry GUI fields (FR28)",
    question: "What does the live telemetry GUI show?",
    answer: `**FR28** specifies that the live telemetry GUI displays each drone's:

- **Location** (map pin with lat/long)
- **Status** (idle, in-flight, returning, fault)
- **State of Charge (SoC)** for battery
- **Mission phase** (takeoff, transit, hover, landing)
- **ETA** to next waypoint or destination

All fields update in step with the ≤5 s telemetry stream.

*Source: §2.2 FR28.*`
  },

  {
    id: "o-live-video-streaming",
    category: "Operations",
    chip: "Live video stream availability (FR16)",
    question: "Is live video streamed from the drones?",
    answer: `Live video is an **optional** capability under **FR16**: when enabled, the onboard camera feed streams to the GCS with **≤500 ms end-to-end latency**.

It is not required for routine deliveries but is provided for inspection, incident review, and supervisor oversight. Video may be toggled per-mission to conserve bandwidth on the refinery's private LTE network.

*Source: §2.2 FR14, FR16.*`
  },

  {
    id: "o-status-interruption-handling",
    category: "Operations",
    chip: "Behaviour on telemetry loss (FR27)",
    question: "What happens when a drone's status updates are interrupted?",
    answer: `If **FR27** status broadcasts are missed for more than the 5 s threshold, the GCS flags the drone as **"comms-degraded"** and triggers an operator alert.

If the gap exceeds the configured timeout, the drone autonomously enters its **fail-safe Return-to-Home (RTH)** behaviour, while the GCS escalates to supervisor and logs the event for post-mission review.

*Source: §2.2 FR27 (cross-ref FR23 fail-safe).*`
  },

  {
    id: "o-mission-audit-logs",
    category: "Operations",
    chip: "Audit log structure (FR32 immutable)",
    question: "How are mission audit logs structured?",
    answer: `Per **FR32**, mission audit logs are **append-only and immutable**, capturing every command, telemetry sample, alert, and operator action with cryptographic hash-chaining.

Each record is timestamped (UTC), tagged with mission ID, drone ID, and actor (system or user), enabling tamper-evident reconstruction of any flight for incident investigation or regulatory audit.

*Source: §2.2 FR32.*`
  },

  {
    id: "o-flight-log-ownership",
    category: "Operations",
    chip: "Flight log storage & ownership (clause 16)",
    question: "Where do flight logs live and who owns them?",
    answer: `Flight logs are stored in **BAPCO's on-premise data store** (mirrored to an approved Bahraini cloud region) and, under **contract clause 16**, **all operational data is owned by BAPCO**.

Valthr retains a **limited licence** to access anonymised logs for support, diagnostics, and product improvement, subject to BAPCO's written approval.

*Source: §10 clause 16; §5.1 data flow.*`
  },

  {
    id: "o-flight-log-retention",
    category: "Operations",
    chip: "Flight log retention period",
    question: "How long are flight logs retained?",
    answer: `Flight logs are retained for a minimum of **7 years** to satisfy Bahraini civil aviation and BAPCO's internal HSE record-keeping policies.

**§8.5 risk #4** flags long-term retention as a managed risk: storage costs and PII handling are mitigated via tiered archival (hot 90 days, warm 1 year, cold archive thereafter) and encryption at rest.

*Source: §8.5 risk #4; §10 clause 16.*`
  },

  {
    id: "o-completion-fault-alerts",
    category: "Operations",
    chip: "Mission alerts via email/Teams (FR33)",
    question: "How does the system alert on completion, fault, or delay?",
    answer: `**FR33** routes mission events to operators via **email and Microsoft Teams** webhooks.

Notifications cover **mission completion** (delivery confirmed), **fault conditions** (sensor failure, geofence breach, RTH triggered), and **delay alerts** (ETA slip beyond threshold). Each alert includes mission ID, drone ID, timestamp, and a deep-link to the telemetry GUI for the affected flight.

*Source: §2.2 FR33.*`
  },

  {
    id: "o-telemetry-user-roles",
    category: "Operations",
    chip: "RBAC roles for telemetry (FR39)",
    question: "Which user roles can see telemetry?",
    answer: `**FR39** defines three RBAC roles with telemetry access:

- **Operator** — full live telemetry plus command authority for assigned drones
- **Supervisor** — fleet-wide telemetry, alerts, and override authority
- **Viewer** — read-only telemetry and historical logs, no command rights

KPI dashboards (§8.7) inherit the same role gating.

*Source: §2.2 FR39; §8.7 KPI logs.*`
  },

  {
    id: "aa-what-is-esg",
    category: "Sustainability",
    chip: "ESG fundamentals",
    question: "What is ESG (Environmental, Social, Governance)?",
    answer: `ESG is a framework used to evaluate an organization's performance across three non-financial dimensions. **Environmental** covers emissions, energy use, waste, and resource impact. **Social** addresses worker safety, community relations, and labor practices. **Governance** concerns board structure, ethics, transparency, and risk management. Specific ESG metrics and disclosure requirements vary by jurisdiction and reporting standard. *General knowledge.*`
  },

  {
    id: "aa-drones-vs-ground-sustainability",
    category: "Sustainability",
    chip: "Drones vs ground vehicles",
    question: "Are drones more sustainable than ground vehicles?",
    answer: `For light payloads over short-to-medium distances, electric drones typically use less energy per delivery than diesel or gasoline ground vehicles, especially when ground routes involve detours or congestion. However, drones become less efficient as payload and range grow, and lifecycle emissions depend on grid mix, battery production, and utilization rates. The advantage is strongest for small, time-sensitive payloads in low-density routes. *General knowledge.*`
  },

  {
    id: "aa-electric-drone-carbon-footprint",
    category: "Sustainability",
    chip: "Per-delivery carbon footprint",
    question: "What is the carbon footprint of an electric drone delivery?",
    answer: `Published estimates for small electric delivery drones often fall in the range of roughly 50-200 grams of CO2-equivalent per delivery, but this varies widely with payload, distance, drone size, and the carbon intensity of the local electricity grid. Battery manufacturing and end-of-life handling also contribute to lifecycle emissions. Always verify with operator-specific lifecycle assessments rather than relying on generic figures. *General knowledge.*`
  },

  {
    id: "aa-battery-cycles-sustainability",
    category: "Sustainability",
    chip: "Battery lifecycle impact",
    question: "How do battery cycles affect drone sustainability?",
    answer: `Drone batteries typically tolerate a few hundred charge cycles before capacity degrades meaningfully, which directly affects how much of the battery's embodied emissions are amortized across deliveries. Higher cycle counts spread manufacturing impact over more flights, lowering per-delivery footprint. Operating practices like avoiding deep discharge, controlling temperature, and using moderate charge rates extend cycle life. Actual longevity depends heavily on chemistry and duty cycle. *General knowledge.*`
  },

  {
    id: "aa-drone-battery-end-of-life",
    category: "Sustainability",
    chip: "Battery recycling and disposal",
    question: "What happens to drone batteries at end of life?",
    answer: `End-of-life lithium batteries are typically collected for either second-life applications (e.g., stationary storage) or recycling to recover cobalt, nickel, lithium, and copper. Regulations in many regions prohibit landfill disposal due to fire and contamination risks. Recycling infrastructure and recovery rates differ significantly by country and chemistry. Operators should follow local hazardous-waste rules and partner with certified recyclers. *General knowledge.*`
  },

  {
    id: "aa-scope-1-2-3-emissions",
    category: "Sustainability",
    chip: "GHG Protocol emission scopes",
    question: "What are Scope 1, 2, 3 emissions (briefly)?",
    answer: `**Scope 1** covers direct emissions from owned or controlled sources, such as company vehicles or on-site combustion. **Scope 2** covers indirect emissions from purchased electricity, heat, or steam. **Scope 3** covers all other indirect emissions in the value chain, including suppliers, transportation, and product use. Scope 3 is usually the largest and hardest to measure accurately. *General knowledge.*`
  },

  {
    id: "aa-autonomous-vs-manual-safety",
    category: "Sustainability",
    chip: "Autonomous system safety",
    question: "Are autonomous systems considered safer than manual workflows?",
    answer: `Autonomous and remotely operated systems can reduce human exposure to hazardous environments such as confined spaces, heights, and chemical zones, which often lowers recordable-incident rates. However, safety outcomes depend on system reliability, redundancy, operator training, and the regulatory framework. Poorly designed automation can introduce new failure modes. The honest answer is "often yes, but context-dependent." *General knowledge.*`
  },

  {
    id: "aa-digital-transformation-heavy-industry",
    category: "Sustainability",
    chip: "Digital transformation outcomes",
    question: "What does digital transformation achieve in heavy industry?",
    answer: `Digital transformation in sectors like oil and gas, mining, and utilities typically aims to improve asset uptime, reduce inspection costs, enhance worker safety, and enable data-driven decisions. Common tools include IoT sensors, drones, digital twins, and predictive analytics. Reported benefits often include double-digit reductions in unplanned downtime and inspection labor. Outcomes depend heavily on integration quality and organizational change management. *General knowledge.*`
  },

  {
    id: "aa-charging-vs-swapping-energy",
    category: "Sustainability",
    chip: "Charging vs battery swapping",
    question: "What's the energy use of charging vs swapping drone batteries?",
    answer: `Charging and swapping consume similar total electricity per kWh delivered to the drone, since the energy ultimately comes from the grid either way. Swapping shifts charging off the critical path, increasing fleet utilization but requiring more battery inventory, which raises embodied emissions. Fast charging can also accelerate degradation, indirectly increasing lifecycle impact. The best choice depends on mission cadence and battery economics. *General knowledge.*`
  },

  {
    id: "aa-drone-delivery-traffic-accidents",
    category: "Sustainability",
    chip: "On-site traffic reduction",
    question: "Does drone delivery reduce on-site vehicle traffic and accidents?",
    answer: `On industrial sites such as refineries, ports, and mines, replacing light vehicle trips with drone deliveries reduces road traffic, which is correlated with lower vehicle-related incident rates. Operators have reported meaningful drops in light-vehicle movements after introducing drones for sample and parts delivery. Quantitative safety improvements depend on baseline traffic, drone airspace management, and procedural integration. Site-specific data is needed for firm conclusions. *General knowledge.*`
  },

  {
    id: "aa-refinery-drone-inspections",
    category: "Sustainability",
    chip: "Refinery inspection benefits",
    question: "How can a refinery benefit from drone-based inspections?",
    answer: `Drones can inspect flare stacks, tank roofs, piping, and elevated structures without scaffolding, rope access, or unit shutdowns, reducing both cost and worker exposure to height and hot-work hazards. They also accelerate turnaround inspections and produce repeatable, geo-tagged imagery for trending. Typical reported benefits include shorter inspection cycles and lower confined-space entries. Realized value depends on integration with reliability and HSE workflows. *General knowledge.*`
  },

  {
    id: "aa-drone-vs-ground-cost-trajectory",
    category: "Sustainability",
    chip: "Long-term cost outlook",
    question: "What's the long-term cost trajectory of drone delivery vs ground vehicles?",
    answer: `Drone delivery costs are generally on a downward trajectory as airframes, batteries, and autonomy mature, while ground-vehicle costs are more stable and dominated by labor and fuel. Many analysts expect per-delivery economics for small payloads to favor drones over time on suitable routes. However, regulatory, airspace, and weather constraints will continue to limit applicability. Long-range forecasts here carry significant uncertainty. *General knowledge.*`
  },

  {
    id: "ab-civil-aviation-authority",
    category: "Regulatory",
    chip: "CAA: national aviation regulator",
    question: "What is a Civil Aviation Authority (CAA)?",
    answer: `A **Civil Aviation Authority (CAA)** is a national government body that regulates civil aviation, including aircraft certification, pilot licensing, airworthiness, and airspace use. CAAs issue rules for both manned and unmanned aircraft (drones), oversee operator approvals, and enforce safety standards. Each country has its own CAA (e.g., UK CAA, Norway's Luftfartstilsynet), though many align with regional frameworks like EASA. For drone delivery, CAA approval is typically required for BVLOS operations, urban flights, and payload-carrying missions. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-faa-vs-caa",
    category: "Regulatory",
    chip: "FAA: US aviation regulator",
    question: "What is the FAA and how is it different from a national CAA?",
    answer: `The **Federal Aviation Administration (FAA)** is the United States' civil aviation regulator, functionally equivalent to a national CAA but specific to US airspace and operators. The FAA issues Part 107 rules for small drones, grants Part 135 certification for delivery operations, and manages waivers for BVLOS flights. Differences from other CAAs lie mainly in jurisdiction, rule structure (e.g., Part 107 vs. EASA's Open/Specific/Certified categories), and integration with NASA's UTM research. Cross-border drone operations often require navigating both FAA and the local CAA. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-easa-overview",
    category: "Regulatory",
    chip: "EASA: EU aviation safety agency",
    question: "What is EASA?",
    answer: `The **European Union Aviation Safety Agency (EASA)** is the EU's centralised aviation regulator, harmonising rules across member states (and EFTA countries including Norway). For drones, EASA defines three operational categories—**Open**, **Specific**, and **Certified**—with corresponding risk-based requirements. EASA also publishes Acceptable Means of Compliance (AMC) and Standard Scenarios (STS) that streamline operator authorisations. National CAAs implement and enforce EASA rules locally. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-drone-flight-approval",
    category: "Regulatory",
    chip: "Process for authorising drone flights",
    question: "How do you get drone flight approval?",
    answer: `Drone flight approval generally requires submitting an **operational authorisation** to the relevant CAA, including a SORA (Specific Operations Risk Assessment) or equivalent risk analysis, operator manual, pilot competencies, and equipment specifications. For routine low-risk flights, registration plus pilot certification may suffice; BVLOS, urban, or payload missions need higher-tier approval. Coordination with air traffic services and local authorities (landowners, municipalities) is often required. Approvals can be one-off, recurring, or tied to a specific corridor or geofenced zone. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-atex-certification",
    category: "Regulatory",
    chip: "ATEX: EU explosive atmospheres directive",
    question: "What is ATEX certification?",
    answer: `**ATEX** (from French *ATmosphères EXplosibles*) is an EU certification regime—Directives 2014/34/EU and 1999/92/EC—governing equipment used in potentially explosive atmospheres such as oil, gas, and chemical sites. Certified equipment is classified by zone (gas: 0/1/2; dust: 20/21/22) and category indicating ignition-source protection. Drones operating near offshore platforms, refineries, or grain silos may require ATEX-rated airframes, batteries, and sensors. Compliance is verified by Notified Bodies issuing EU-Type Examination certificates. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-intrinsically-safe",
    category: "Regulatory",
    chip: "Equipment unable to ignite hazardous atmospheres",
    question: "What is \"intrinsically safe\" in industrial certification?",
    answer: `**Intrinsically safe (IS)** is a protection method certifying that electrical equipment cannot release sufficient energy—thermal or electrical—to ignite a flammable atmosphere, even under fault conditions. It is one of several "Ex" protection types (alongside flameproof, increased safety, etc.) under IEC 60079-11 and ATEX. IS designs limit voltage, current, and stored energy in circuits and components. For industrial-inspection drones operating in Zone 1/2 areas, intrinsically safe sensors and communications hardware are often mandatory. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-iso-certification-general",
    category: "Regulatory",
    chip: "ISO: international standards conformance",
    question: "What is ISO certification (in general)?",
    answer: `**ISO certification** is third-party attestation that an organisation or product conforms to a standard published by the International Organization for Standardization. Common examples include **ISO 9001** (quality management), **ISO 27001** (information security), and **ISO 21384** (drones). Certification is issued by accredited bodies after audit, and is typically renewed annually. ISO standards are voluntary but often required by customers, regulators, or insurers as evidence of process maturity. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-ieee-iso-iec-12207",
    category: "Regulatory",
    chip: "Software life-cycle process standard",
    question: "What is IEEE/ISO/IEC 12207 (referenced in Valthr §6.2)?",
    answer: `**IEEE/ISO/IEC 12207** is the international standard defining processes for the **software life cycle**, covering acquisition, supply, development, operation, maintenance, and disposal. It provides a common process framework so organisations and suppliers can align on tasks, activities, and deliverables across software projects. For safety-critical or regulated systems—such as drone autonomy software—12207 underpins traceability, configuration management, and verification practices. It is often used alongside ISO/IEC 15288 (systems engineering) and DO-178C (airborne software). Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-type-certification-aircraft",
    category: "Regulatory",
    chip: "Approval of an aircraft design as airworthy",
    question: "What does \"type certification\" mean for an aircraft?",
    answer: `**Type certification** is the formal approval by an aviation authority (FAA, EASA, etc.) that a specific aircraft **design** meets airworthiness standards. It applies to the model itself—structure, propulsion, avionics, performance—rather than to individual airframes, which receive separate **airworthiness certificates**. The process involves design reviews, ground and flight tests, and demonstration of compliance with certification specifications (e.g., CS-23, Part 23). For drones, type certification is required in EASA's *Certified* category and for higher-risk delivery aircraft. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-drone-liability-insurance",
    category: "Regulatory",
    chip: "Coverage for damage caused by drone operations",
    question: "What is liability insurance for drone operations?",
    answer: `**Drone liability insurance** covers third-party bodily injury and property damage caused by drone operations, and is mandatory in many jurisdictions (e.g., EU Regulation 785/2004 sets minimum cover by MTOM). Policies may also include hull cover for the aircraft, payload cover, and cyber/data-loss extensions. Operators typically need to demonstrate proof of insurance to the CAA before authorisation is granted. Coverage limits scale with operational risk, MTOM, and whether flights are over populated areas. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-utm-air-traffic-management",
    category: "Regulatory",
    chip: "UTM: traffic management for unmanned aircraft",
    question: "What is air traffic management for drones (UTM)?",
    answer: `**Unmanned Aircraft System Traffic Management (UTM)** is the digital, largely automated system for coordinating drone flights in low-altitude airspace, complementing classical ATM for crewed aircraft. UTM services include registration, identification, flight authorisation, geofencing, conflict detection, and dynamic geo-awareness. In the EU, the equivalent framework is **U-space** (Regulation 2021/664). UTM allows scalable operations like delivery and inspection by enabling many simultaneous flights without direct controller-pilot voice communication. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ab-drone-corridor-regulation",
    category: "Regulatory",
    chip: "Designated airspace volume for drone routes",
    question: "What is a \"drone corridor\" and how is it regulated?",
    answer: `A **drone corridor** is a defined volume of airspace—lateral, vertical, and often time-bounded—reserved or prioritised for drone operations between specified endpoints. Corridors simplify approval by pre-clearing the route with the CAA, ATC, landowners, and municipalities, and may include published procedures for entry, exit, and contingency. They are commonly used for medical, logistics, and inspection BVLOS missions. Regulation typically combines a CAA operational authorisation, NOTAMs, U-space/UTM integration, and local agreements. Project-specific context: see Valthr §8.5 / §10 clause 14. *General knowledge.*`
  },

  {
    id: "ac-hello",
    category: "Casual",
    chip: "Hi!",
    question: "Hi, what is this?",
    answer: `Hey, welcome to **Valthr**!

I'm the research assistant for the Valthr drone-delivery project at BAPCO. Ask me about the **routing engine**, **cost analysis**, **risk register**, **stakeholders**, **methodology**, **schedule**, or anything else from the report.

Try a question like *"What's the cost per mission?"* or *"Why Floyd-Warshall?"*

*General knowledge.*`
  },

  {
    id: "ac-who-are-you",
    category: "Casual",
    chip: "Who are you?",
    question: "Who are you?",
    answer: `I'm the **Valthr Research Intelligence** assistant — a chatbot grounded exclusively in the Valthr Group Report (Group 01, MSIN0068). I'm powered by Gemini 2.5 Flash with a low temperature so I stick to what's actually in the document.

If a question goes beyond the report, I'll say so rather than guess.

*General knowledge.*`
  },

  {
    id: "ac-what-can-you-help-with",
    category: "Casual",
    chip: "What can you help me with?",
    question: "What can you help me with?",
    answer: `I can answer questions across the whole Valthr report, including:

- **Architecture & comms** (Wi-Fi mesh, micro-bases, fleet design)
- **Routing & simulation** (Floyd-Warshall, greedy assignment)
- **Cost** (CAPEX, OPEX, cost-per-mission, ABC breakdown)
- **Methodology** (Agile-Scrum, Spiral, V-model)
- **Risks, stakeholders, schedule, and compliance** (Bahrain CAA)

Just ask in plain English.

*General knowledge.*`
  },

  {
    id: "ac-who-is-valthr",
    category: "Casual",
    chip: "Who is Valthr?",
    question: "Who is Valthr?",
    answer: `**Valthr** is the proposed autonomous drone-delivery system designed for **BAPCO's 2.5 × 2 km refinery in Bahrain**. The proposal deploys **20 electric drones** across **9 micro-base stations**, replacing manual ground delivery of lab samples, spare parts and safety gear.

It's not a company — it's the project name used throughout the report.

*Project context.*`
  },

  {
    id: "ac-why-called-valthr",
    category: "Casual",
    chip: "Why is it called Valthr?",
    question: "Why is the project called Valthr?",
    answer: `The report doesn't formally explain the name, so this is **informed speculation**: "Valthr" reads as a stylised blend of **"value"** and **"her"** — fitting a system whose pitch is *delivering at the speed of sight* and recovering engineering value for BAPCO. The Norse-styled spelling also nods to the brand's clean, modern identity.

Take that as the team's reading rather than an official etymology.

*General knowledge.*`
  },

  {
    id: "ac-who-built-this-site",
    category: "Casual",
    chip: "Who built this site?",
    question: "Who built this website?",
    answer: `The site was built by **Group 01** for MSIN0068 at UCL. **Taro Kuroda** led the UI design, built the interactive site, and integrated this AI assistant; **Hugo Valade** ported the MATLAB simulation prototype to JavaScript and built the real-time Leaflet map playback.

It's a static site hosted on **GitHub Pages**, using **Leaflet.js** for the map and **Gemini 2.5 Flash** for the chatbot.

*General knowledge.*`
  },

  {
    id: "ac-real-product-or-uni-project",
    category: "Casual",
    chip: "Is this a real product or a uni project?",
    question: "Is Valthr a real product or a university project?",
    answer: `Valthr is a **university research project**, not a deployed commercial product. It's a feasibility proposal designed for BAPCO Bahrain, complete with cost analysis, risk register, and a working simulation — but it has not been built or flown.

Think of it as a fully-costed, evidence-backed design study.

*Project context.*`
  },

  {
    id: "ac-what-course",
    category: "Casual",
    chip: "What course is this for?",
    question: "What course is this project for?",
    answer: `This is the **MSIN0068 — Project Management** module at the **UCL School of Management**. The deliverable is **Group 01's** end-of-module project: a full project-management proposal covering scope, methodology, costing, scheduling, risk, and stakeholder management.

The site you're on is the interactive companion to that report.

*Project context.*`
  },

  {
    id: "ac-who-is-client",
    category: "Casual",
    chip: "Who is your client?",
    question: "Who is the client for this project?",
    answer: `The client is **BAPCO (Bahrain Petroleum Company) Refining**, operator of the 2.5 × 2 km refinery in Bahrain at roughly **26.11 N, 50.61 E**. Today they still move **lab samples, spare parts and safety gear** by hand across the site — Valthr targets that workflow.

*Project context.*`
  },

  {
    id: "ac-where-is-simulation",
    category: "Casual",
    chip: "Where can I see the simulation?",
    question: "Where can I see the simulation or live map?",
    answer: `Scroll to the **Simulation** section on this page (or click *Simulation* in the top nav). You'll see a Leaflet map of the BAPCO network with **9 stations**, **17 routes**, and a **3-drone fleet** running Floyd-Warshall routing with greedy assignment.

Hit **Run** to play it back — there's also a *Simulation Tour* button if you want a guided walkthrough.

*General knowledge.*`
  },

  {
    id: "ac-download-report",
    category: "Casual",
    chip: "Can I download the report?",
    question: "Can I download the full report?",
    answer: `Yes — the full PDF lives at **\`assets/GROUP_01_Drone Delivery.pdf\`** in the site repository. Every answer I give is grounded in that document, and I cite section numbers (e.g. *§5.1*, *§7.3*) so you can jump straight to the source.

*General knowledge.*`
  },

  {
    id: "ac-team-contact",
    category: "Casual",
    chip: "Where can I find your contact details?",
    question: "Where can I find your team's contact details?",
    answer: `The **Team** section near the bottom of the page lists all five members of **Group 01**: Victor Brinzan, Rustam Toshov, Hugo Valade, Lea Dabboussi, and Taro Kuroda, each with their role on the project.

This is a coursework site, so direct contact details aren't published — for academic enquiries, the appropriate channel is **MSIN0068 staff at the UCL School of Management**.

*General knowledge.*`
  },

  {
    id: "ad-airspace-controlled-vs-uncontrolled",
    category: "Aviation",
    chip: "Airspace: controlled vs uncontrolled",
    question: "What is airspace, and how does controlled differ from uncontrolled?",
    answer: `**Airspace** is the volume of sky above a region, divided into classes (A through G in ICAO conventions) that govern who can fly there and under what rules. **Controlled airspace** (Classes A-E) requires aircraft to be in contact with air traffic control (ATC), follow clearances, and often carry specific equipment like transponders. **Uncontrolled airspace** (typically Class G, near the ground in rural areas) lets pilots fly without ATC clearance, though they must still follow visual flight rules and see-and-avoid responsibilities. Drones typically operate in low-altitude airspace (often below 400 feet) with special rules carved out by regulators like the FAA or EASA.

*General knowledge.*`
  },

  {
    id: "ad-flight-corridors",
    category: "Aviation",
    chip: "Flight corridors for drones",
    question: "What are flight corridors and why do drones use them?",
    answer: `**Flight corridors** are predefined three-dimensional routes through airspace that aircraft are expected to follow, bounded by altitude floors and ceilings and lateral limits. For drones, corridors concentrate traffic into known lanes, making it easier for regulators, operators, and other airspace users to predict where unmanned aircraft will be. They also simplify deconfliction with manned aviation, reduce noise impact by routing flights away from sensitive areas, and let operators pre-clear safety hazards along the path. Many delivery drone programs negotiate corridors with civil aviation authorities as part of beyond-visual-line-of-sight (BVLOS) approvals.

*General knowledge.*`
  },

  {
    id: "ad-piloted-vs-autonomous",
    category: "Aviation",
    chip: "Piloted vs autonomous aircraft",
    question: "What is the difference between piloted and autonomous aircraft?",
    answer: `A **piloted aircraft** has a human directly controlling flight inputs, either onboard or remotely (as with traditional RC drones). An **autonomous aircraft** plans and executes its mission using onboard software - navigating waypoints, handling obstacles, and managing energy - without continuous human stick input. Most real-world systems are a hybrid: a remote pilot or operator supervises one or many drones, intervenes on exceptions, and authorizes critical decisions, while the aircraft handles routine flight. The degree of autonomy varies widely, from simple autopilot hold modes to fully self-managing fleets.

*General knowledge.*`
  },

  {
    id: "ad-sense-and-avoid",
    category: "Aviation",
    chip: "Sense-and-avoid (detect-and-avoid)",
    question: "What is sense-and-avoid in aviation?",
    answer: `**Sense-and-avoid** (also called **detect-and-avoid**, or DAA) is an aircraft's ability to perceive nearby traffic, terrain, or obstacles and take action to maintain safe separation. For manned aircraft this is largely visual ("see-and-avoid"), supplemented by systems like TCAS. For drones, DAA combines sensors such as ADS-B receivers, radar, lidar, cameras, and acoustic detectors with software that classifies threats and triggers avoidance maneuvers. Robust DAA is a prerequisite for routine BVLOS drone operations because there is no onboard pilot looking out the window.

*General knowledge.*`
  },

  {
    id: "ad-fail-safe-aviation",
    category: "Aviation",
    chip: "Fail-safe behavior",
    question: "What is a fail-safe in aviation?",
    answer: `A **fail-safe** is a designed behavior that, when something goes wrong, brings the system to a safe state rather than an uncontrolled one. In drones this often means actions like return-to-home on lost link, automatic landing on low battery, hover-and-hold on GPS loss, or controlled descent on motor failure. Fail-safes are tiered: the aircraft picks the safest option still available given the failure mode. Designing them well requires understanding which failures are most likely and which outcomes (e.g., landing immediately vs. flying home) minimize risk to people on the ground.

*General knowledge.*`
  },

  {
    id: "ad-redundancy-safety-critical",
    category: "Aviation",
    chip: "Redundancy in safety-critical systems",
    question: "What is redundancy in safety-critical systems?",
    answer: `**Redundancy** means duplicating critical components so that the failure of one does not cause the system to fail. Aircraft commonly use dual or triple redundancy on flight computers, sensors (IMUs, GPS, altimeters), power buses, and control surfaces, often with **dissimilar redundancy** (different hardware or algorithms) to avoid common-mode failures. Voting logic compares outputs and flags disagreements, isolating a faulty unit. For delivery drones, redundancy is increasingly required by regulators as flights move over people and beyond visual line of sight, since a single point of failure becomes unacceptable.

*General knowledge.*`
  },

  {
    id: "ad-flight-log",
    category: "Aviation",
    chip: "Flight logs and why they matter",
    question: "What is a flight log and why is it kept?",
    answer: `A **flight log** is a record of a flight's key data: timestamps, route, altitudes, control inputs, sensor readings, system events, and any anomalies or warnings. For piloted aircraft, logs serve maintenance scheduling, regulatory compliance, and incident investigation. For drones, on-board logs (often gigabytes per flight) are also used for fleet health monitoring, post-flight diagnostics, machine-learning model improvement, and proving compliance with operating limitations. After an incident, logs are typically the first artifact investigators examine to reconstruct what happened.

*General knowledge.*`
  },

  {
    id: "ad-autonomy-levels",
    category: "Aviation",
    chip: "Autonomy levels (SAE-style)",
    question: "What are autonomy levels in SAE / industry terms?",
    answer: `**Autonomy levels** describe how much of a vehicle's operation is handled by software vs. a human. The SAE J3016 scale, originally for cars, runs from **Level 0** (no automation) through **Level 5** (full automation, no human needed). Aviation analogs map roughly: Level 1-2 is autopilot assistance, Level 3 is conditional automation with human fallback, Level 4 is high automation within a defined operational domain, and Level 5 is unrestricted full autonomy. Most commercial delivery drones today operate at roughly Level 3-4 within constrained corridors and weather envelopes, with remote operators as the fallback.

*General knowledge.*`
  },

  {
    id: "ad-longest-running-drone-delivery",
    category: "Aviation",
    chip: "Longest-running drone delivery service",
    question: "What is the longest-running autonomous drone delivery service today?",
    answer: `**Zipline**, founded in 2014, operates the longest-running autonomous drone delivery service, with commercial flights beginning in Rwanda in October 2016 to deliver blood and medical supplies. The service has since expanded to Ghana, Nigeria, Kenya, Cote d'Ivoire, Japan, and the United States, completing well over a million commercial deliveries by the mid-2020s. **Wing** (an Alphabet subsidiary) is another long-running operator, having launched commercial deliveries in Australia in 2019. Both have been important proving grounds for BVLOS regulation, fail-safe design, and high-tempo autonomous operations.

*General knowledge.*`
  },

  {
    id: "ad-geofencing-aviation",
    category: "Aviation",
    chip: "Geofencing for drones",
    question: "What is geofencing in aviation contexts?",
    answer: `**Geofencing** is software that prevents an aircraft from entering or leaving defined geographic boundaries, typically by comparing GPS position to a stored polygon and altitude band. In drones, geofences enforce no-fly zones around airports, prisons, stadiums, and sensitive infrastructure, and they confine vehicles to approved operating areas. Manufacturers like DJI ship factory geofence databases, and operators can layer custom fences for specific missions. Well-designed geofencing is paired with fail-safes (e.g., stop, hover, or return) so that hitting a boundary produces a safe outcome rather than an abrupt failure.

*General knowledge.*`
  },

  {
    id: "ad-line-of-sight",
    category: "Aviation",
    chip: "Visual line of sight (VLOS)",
    question: "Why is line of sight important for traditional drone operations?",
    answer: `**Visual line of sight** (VLOS) means the remote pilot can see the drone with unaided eyes throughout the flight. It is the default regulatory regime for small drones in most jurisdictions because it lets the pilot see-and-avoid other traffic, judge wind and orientation, and react quickly to anomalies. **Beyond visual line of sight** (BVLOS) operations require additional safety cases - such as detect-and-avoid systems, redundant links, and trained operators - because the pilot can no longer rely on direct observation. Routine BVLOS approval is the single biggest regulatory hurdle for scaling autonomous drone delivery.

*General knowledge.*`
  },

  {
    id: "ad-remote-pilot-autonomous-fleets",
    category: "Aviation",
    chip: "Remote pilot role in autonomous fleets",
    question: "What is the role of a remote pilot in autonomous fleets?",
    answer: `In autonomous fleets, the **remote pilot** (sometimes called a flight operator or mission supervisor) does not fly the aircraft moment-to-moment - instead they oversee multiple drones simultaneously through a console. Their job is to authorize launches, monitor health and weather, respond to alerts, take manual control if needed, and coordinate with air traffic services or ground crews. Regulators typically require a licensed remote pilot to be responsible for each flight even when software is doing the flying. As autonomy improves, the pilot-to-aircraft ratio grows, which is one of the main economic levers for drone delivery to scale.

*General knowledge.*`
  },

  {
    id: "ae-validation-verification",
    category: "QA",
    chip: "V&V: building the right thing vs building it right",
    question: "What is software validation and verification (V&V)?",
    answer: `**Verification** asks "are we building the product right?" — checking that software conforms to its specifications through reviews, static analysis, and unit tests. **Validation** asks "are we building the right product?" — confirming the software meets the user's actual needs via acceptance testing and field trials. Together, V&V provides evidence that a system is fit for purpose, which is essential for safety-critical or contractually bound deployments like those described under Valthr §10 clauses 7-10. Both activities run throughout the lifecycle, not just at the end.

*General knowledge.*`
  },

  {
    id: "ae-unit-integration-system-testing",
    category: "QA",
    chip: "Three test scopes: function, interaction, full system",
    question: "What's the difference between unit, integration, and system testing?",
    answer: `**Unit testing** validates the smallest testable pieces (functions, classes) in isolation, typically via developer-written automated tests. **Integration testing** verifies that units work together correctly across module boundaries, catching interface mismatches and data-flow issues. **System testing** exercises the fully assembled application against requirements end-to-end, including non-functional aspects like performance and security. A typical Valthr §10 clauses 7-10 scope mandates all three layers before acceptance.

*General knowledge.*`
  },

  {
    id: "ae-digital-twin",
    category: "QA",
    chip: "Live virtual replica of a physical asset or process",
    question: "What is a digital twin?",
    answer: `A **digital twin** is a continuously updated virtual model of a physical system — equipment, plant, or process — that mirrors its real-time state via sensor data. It enables simulation, "what-if" analysis, predictive maintenance, and operator training without disturbing the live asset. Twins range from simple parametric models to high-fidelity multi-physics simulations integrated with IoT pipelines. In contracts like Valthr §10 clauses 7-10, a twin is often used to validate control logic before commissioning.

*General knowledge.*`
  },

  {
    id: "ae-hardware-in-the-loop",
    category: "QA",
    chip: "HIL: real controller tested against simulated plant",
    question: "What is hardware-in-the-loop testing?",
    answer: `**Hardware-in-the-loop (HIL)** testing connects a real physical controller (PLC, ECU, embedded board) to a simulated model of the system it would normally control. The simulator feeds the controller realistic sensor signals and reacts to its outputs in real time, so engineers can exercise edge cases and faults safely. HIL shortens commissioning, exposes timing and I/O bugs, and validates safety interlocks before any live equipment is energised. This is often a prerequisite step under Valthr §10 clauses 7-10 acceptance gates.

*General knowledge.*`
  },

  {
    id: "ae-fat-vs-sat",
    category: "QA",
    chip: "FAT at vendor site, SAT at customer site",
    question: "What is FAT vs SAT (Factory / Site Acceptance Test)?",
    answer: `A **Factory Acceptance Test (FAT)** is run at the supplier's premises before shipment to demonstrate that equipment or software meets contractual requirements in a controlled environment. A **Site Acceptance Test (SAT)** repeats and extends those checks after installation at the customer's site, where real interfaces, networks, and field signals are present. FAT catches defects cheaply; SAT proves integration with the actual operating environment. Valthr §10 clauses 7-10 typically tie payment milestones to signed FAT and SAT certificates.

*General knowledge.*`
  },

  {
    id: "ae-acceptance-criteria",
    category: "QA",
    chip: "Pre-agreed conditions that mark work as complete",
    question: "What is acceptance criteria in testing?",
    answer: `**Acceptance criteria** are explicit, testable conditions — defined before work begins — that a deliverable must satisfy to be considered complete and accepted by the customer. They translate fuzzy requirements into pass/fail checks covering functionality, performance, usability, and compliance. Good criteria are specific, measurable, and traceable to a requirement ID. Under Valthr §10 clauses 7-10, criteria typically anchor sign-off and trigger contractual milestones.

*General knowledge.*`
  },

  {
    id: "ae-regression-testing",
    category: "QA",
    chip: "Re-running tests to catch newly broken old behaviour",
    question: "What is regression testing?",
    answer: `**Regression testing** re-executes previously passing tests after any code change to confirm that existing functionality has not been inadvertently broken. It is usually automated and run on every build or merge so defects are caught immediately rather than during release. A well-curated regression suite balances coverage with execution time, often layered (smoke, full, nightly). For long-running engagements like Valthr §10 clauses 7-10, regression discipline protects the cumulative value of earlier acceptance work.

*General knowledge.*`
  },

  {
    id: "ae-defect-severity",
    category: "QA",
    chip: "S1 critical, S2 major, S3 minor — impact-based ranking",
    question: "What is a defect severity classification (S1/S2/S3)?",
    answer: `**Severity** ranks how badly a defect impacts the system, independent of how often it occurs. **S1 (Critical)** means the system or a core function is unusable with no workaround — typically a stop-ship issue. **S2 (Major)** means significant functionality is impaired but a workaround exists. **S3 (Minor)** covers cosmetic issues or low-impact bugs that don't block operation. Valthr §10 clauses 7-10 commonly cap the number of open S1/S2 defects permitted at acceptance.

*General knowledge.*`
  },

  {
    id: "ae-acceptance-test-plan",
    category: "QA",
    chip: "Document defining how acceptance will be proven",
    question: "What is an acceptance test plan?",
    answer: `An **acceptance test plan (ATP)** is a formal document that lists every test case, procedure, expected result, and pass/fail criterion used to demonstrate that a deliverable satisfies its contractual requirements. It identifies roles, prerequisites, test data, environment, and traceability back to the requirement specification. The ATP is normally reviewed and signed by both supplier and customer before execution begins. It is a cornerstone artefact for Valthr §10 clauses 7-10 milestone closure.

*General knowledge.*`
  },

  {
    id: "ae-rfp-demo",
    category: "QA",
    chip: "Live walkthrough proving claimed capabilities",
    question: "What does \"demo\" mean in an RFP context?",
    answer: `In an **RFP (Request for Proposal)** context, a **demo** is a structured live demonstration where bidders show their proposed solution executing representative scenarios from the buyer's requirements. It moves the evaluation beyond paper claims by letting evaluators observe actual behaviour, ask questions, and probe edge cases. Buyers typically supply a scripted scenario list and scoring rubric to ensure fair comparison across vendors. For procurements scoped like Valthr §10 clauses 7-10, the demo often gates shortlisting before contract negotiation.

*General knowledge.*`
  },

  {
    id: "ae-pilot-deployment",
    category: "QA",
    chip: "Limited rollout to validate before full deployment",
    question: "What is a pilot deployment / pilot programme?",
    answer: `A **pilot deployment** is a small-scale, time-boxed rollout of a system to a limited set of users, sites, or assets to validate real-world performance, usability, and integration before committing to enterprise-wide rollout. It surfaces operational issues that lab testing misses and provides evidence for go/no-go decisions. Pilots typically have explicit success metrics, a defined exit review, and a rollback plan. Under Valthr §10 clauses 7-10, a successful pilot often unlocks the production-rollout phase of the contract.

*General knowledge.*`
  },

  {
    id: "ae-configuration-management",
    category: "QA",
    chip: "Controlling versions, baselines, and changes systematically",
    question: "What is configuration management?",
    answer: `**Configuration management (CM)** is the discipline of identifying, controlling, recording, and auditing the components and settings that make up a system across its lifecycle. It uses version control, baselines, change requests, and configuration items (CIs) so any deployed state is traceable and reproducible. Good CM prevents "works on my machine" problems, supports rollback, and underpins reliable audits. Valthr §10 clauses 7-10 typically require a documented CM plan as part of the quality assurance regime.

*General knowledge.*`
  },

  {
    id: "p-how-chatbot-works",
    category: "Meta",
    chip: "How does this chatbot work?",
    question: "How does this chatbot work?",
    answer: `The chat has **two layers**:

1. **Primary path — Gemini 2.5 Flash.** When the API is reachable, your message is sent (with the full Valthr report as context) and the model writes a fresh answer.
2. **Fallback path — local TF-IDF classifier.** If the Gemini API is unreachable or rate-limited, the chat switches to a local search-based system: it tokenises your message and scores it against a bank of ~500 curated Q&A entries, returning the closest match.

Either way, you can also use the **autocomplete** in the input box — start typing a keyword and the bank suggests matching curated questions you can pick directly.

*Implementation note: see assets/js/chatbot.js, assets/js/classifier.js.*`
  },

  {
    id: "p-classifier-explanation",
    category: "Meta",
    chip: "How does the classifier match my question?",
    question: "How does the classifier match my free-text question to a curated answer?",
    answer: `The classifier uses **TF-IDF** with **cosine similarity** — a classic information-retrieval technique:

1. **Tokenise** your message — lowercase, strip punctuation, drop common stopwords ("the", "is", "what"...), apply crude singularisation.
2. **Vectorise** — turn the remaining tokens into a sparse weighted vector. Each term is weighted by **TF** (sub-linear: \`1 + ln(count)\`) × **IDF** (smoothed: \`1 + ln((N+1)/(df+1))\`), so rare-but-relevant words like "ATEX" weigh much more than common ones.
3. **Cosine similarity** — compute the angle between your query vector and each of the ~500 pre-built doc vectors. Top match wins.
4. **Confidence framing** — strong matches (≥ 0.32) are surfaced as *"Closest match"*; medium matches (≥ 0.12) as *"This might be related"*; weak matches still get an answer with even more cautious framing.

The whole thing runs client-side in <2 ms.`
  },

  {
    id: "p-no-neural-network",
    category: "Meta",
    chip: "Is the fallback chatbot a neural network?",
    question: "Is the fallback chatbot a neural network or LLM?",
    answer: `**No.** The fallback is a classical **TF-IDF + cosine similarity** information-retrieval system — no neural network, no embeddings learned by gradient descent, no transformer.

It has roughly **12,700 numerical parameters** (one IDF weight per vocabulary term + sparse TF-IDF weights for each of the ~500 curated docs). For comparison, a small LLM like GPT-2 has 124 million; this is about **0.01% of GPT-2's size**.

The "training" was a single counting pass through the Q&A bank to compute term frequencies — there's no loss function, no iteration, no gradient descent.

The trade-off: it can't generalise beyond literal word matches (no semantic understanding of synonyms unless they're in the corpus), but it's **fast, free, deterministic, runs entirely in the browser, and never hallucinates** — it can only return text written by the Valthr team.`
  },

  {
    id: "p-when-fallback-engages",
    category: "Meta",
    chip: "When does the fallback chatbot engage?",
    question: "When does the chatbot switch to the fallback (curated answers) path?",
    answer: `The chat starts in **AI mode** (Gemini 2.5 Flash). It switches to **fallback mode** the first time any of these happen during a session:

- The Gemini API returns a non-recoverable error (most often **HTTP 429** = rate-limit / quota exceeded)
- A **network exception** prevents the request from completing
- The API key isn't configured (no \`assets/data/config.js\`)

Once flipped, the session stays in fallback (no flapping back-and-forth). Resetting the chat does **not** retry — the Gemini quota typically resets at midnight Pacific Time, so a page refresh after that should restore AI mode.

In fallback mode, your message goes through the local classifier instead of the API.`
  },

  {
    id: "p-autocomplete-explained",
    category: "Meta",
    chip: "How does the autocomplete work?",
    question: "How does the autocomplete suggestion list work?",
    answer: `As you type in the chat input, the autocomplete dropdown shows up to **6 matching curated questions** ranked by:

1. **Chip prefix match** (highest priority) — your text begins the suggestion's chip
2. **Chip substring match** — your text appears anywhere in the chip
3. **Question substring match** — your text appears in the full question

Match characters are highlighted in orange.

**Keyboard:** ↓/↑ navigate, Enter picks the active row, Tab takes the top match, Esc dismisses. Click also works.

Picking a suggestion routes through the same pipeline as a free-text submit — Gemini in normal mode, classifier in fallback mode.`
  },

  {
    id: "p-qa-bank-size",
    category: "Meta",
    chip: "How many curated questions are there?",
    question: "How many curated Q&A entries does the chatbot know?",
    answer: `Roughly **500 curated Q&A entries**, written by the Valthr team and grounded in the project research report.

They span ~20 categories: project description, requirements (FR / NFR / IR / CR / DV), WBS, schedule, methodology (Agile, Spiral, V-model), system architecture, fleet routing, cost estimation, all six risk categories (Strategic, Technical, AI & Data, Operational, Regulatory, Financial), KPIs, RFP, contract clauses, plus background knowledge on AI, drones, refinery operations, project management, networking, cybersecurity, Bahrain context, and how this chatbot itself works.

*See assets/data/qa.js for the full list.*`
  },

  {
    id: "p-honest-substitution",
    category: "Meta",
    chip: "Why does the bot say \"Closest match\"?",
    question: "Why does the chatbot sometimes show a \"Closest match\" header before its answer?",
    answer: `When you type a free-text question in fallback mode and the classifier finds a match that isn't a perfect fit, the bot prefixes the answer with one of:

- *"Closest match in the report — **<chip>**"* (high confidence, score ≥ 0.32)
- *"This might be related — **<chip>**"* (medium, ≥ 0.12)
- *"Not sure I have a great match — closest is **<chip>**"* (weak, ≥ 0.02)

This is a **transparency choice**. The classifier may have misunderstood your question, and showing what it matched on lets you:
1. Spot when the answer doesn't actually address your question.
2. Reformulate or pick from the autocomplete suggestions instead.

It's the alternative to silently substituting one question for another.`
  },

  {
    id: "p-data-sources",
    category: "Meta",
    chip: "Where does the chatbot get its information?",
    question: "Where does the chatbot get its information from?",
    answer: `Two sources, in order of priority:

1. **The Valthr research report** — a 5,000+ line PDF (\`assets/GROUP_01_Drone Delivery.pdf\`) covering the full project: requirements, architecture, costs, risks, methodology, RFP, contract. **Every project-specific answer is grounded in this report**, with section references in the format \`*Source: §X.Y …*\`.

2. **General domain knowledge** — for broader questions about AI, drones, refinery operations, project management, etc., the curated bank includes background entries written from general technical knowledge. These are clearly framed and tagged.

The chatbot **does not** browse the web, query external knowledge bases, or train on user conversations.`
  },

  {
    id: "p-privacy",
    category: "Meta",
    chip: "Is what I type stored anywhere?",
    question: "Is my chat conversation stored or used for training?",
    answer: `**The Valthr team stores nothing.** This is a static GitHub Pages site — there's no backend, no analytics on chat content, no database.

When the chat is in **AI mode**, your messages are sent to Google's Gemini API as part of the request. Google's data-handling policy applies — see Google's Gemini terms for what they retain. The API key in client JS lets anyone view requests in browser DevTools.

When the chat is in **fallback mode**, nothing leaves your browser at all — the classifier runs entirely client-side.

Recommendation: don't paste sensitive or confidential information into the chat.`
  },

  {
    id: "p-tech-stack",
    category: "Meta",
    chip: "What technologies power this site?",
    question: "What technology stack does the Valthr website use?",
    answer: `**Static site, no backend:**
- **HTML / CSS / vanilla JavaScript** — no framework
- **Tailwind CDN** — utility-first CSS
- **GitHub Pages** — hosting
- **marked.js** (CDN) — markdown rendering for chat answers
- **Lucide icons** + **Intro.js** — UI helpers

**Chat-specific:**
- **Gemini 2.5 Flash** API for the AI path
- **Custom TF-IDF classifier** (vanilla JS, ~5 KB) for the fallback path

**Visualisations:**
- **Leaflet.js** for the BAPCO network map
- **Plain Canvas / SVG** for the simulation

No build step, no bundler — every file in the repo is served as-is by GitHub Pages.`
  },

  {
    id: "p-why-tfidf-not-llm",
    category: "Meta",
    chip: "Why use TF-IDF for the fallback?",
    question: "Why did you build a TF-IDF classifier instead of using a free LLM API for the fallback?",
    answer: `Three reasons:

1. **Cost & rate limits.** Any free LLM API (Groq, OpenRouter, etc.) has rate limits and the API key would have to be exposed in client JS — same problem as Gemini. We'd be back where we started in three months.

2. **Determinism & honesty.** TF-IDF can only return **text the Valthr team wrote**. It can't hallucinate, can't make up numbers, can't get a clause wrong. For an assessment-grade research assistant, that matters more than fluency.

3. **Zero infrastructure.** TF-IDF runs in the browser with no API, no auth, no quota. Index file is ~190 KB; query takes <2 ms. The whole thing keeps working forever for free.

The trade-off is fluency: the LLM can paraphrase and synthesise, the TF-IDF can only retrieve. But it always returns something correct.`
  },

  {
    id: "p-can-i-fork",
    category: "Meta",
    chip: "Can I reuse this chatbot for my own project?",
    question: "Can I reuse this chatbot for my own project or document?",
    answer: `Yes — the architecture is generic. To adapt it:

1. **Replace the Q&A bank** in \`assets/data/qa.js\` with your own entries (same schema: \`id, category, chip, question, answer\` markdown).
2. **Run the index builder** — \`node tools/build-qa-index.js\` regenerates \`qa-index.json\` from your bank.
3. **Update the system prompt** in \`assets/js/chatbot.js\` (the \`buildSystemPrompt\` function) to describe your domain instead of the Valthr report.
4. **Optional — replace Gemini** with your preferred LLM endpoint in the same file.
5. **Deploy** — push to GitHub Pages or any static host.

The classifier and autocomplete need no changes. The repo is on GitHub at Valthr/Website.`
  },

  {
    id: "q-what-is-ai",
    category: "AI",
    chip: "AI: machines performing tasks that need human-like intelligence",
    question: "What is artificial intelligence?",
    answer: `Artificial intelligence (AI) is the field of computer science focused on building systems that perform tasks typically requiring human intelligence, such as perception, reasoning, planning, and language understanding. Modern AI is dominated by *statistical* approaches that learn patterns from data rather than following hand-coded rules. AI ranges from narrow systems (e.g. a spam filter or an obstacle detector) to broader agents that combine perception, decision-making, and control. In engineering practice, "AI" is usually shorthand for machine-learning models embedded in a larger software system.

*General knowledge.*`
  },

  {
    id: "q-ai-vs-ml",
    category: "AI",
    chip: "ML is a subset of AI focused on learning from data",
    question: "What's the difference between AI and machine learning?",
    answer: `AI is the broad goal of building intelligent behaviour; machine learning (ML) is one approach to achieving it, in which a system improves its performance on a task by learning from examples rather than being explicitly programmed. All ML is AI, but not all AI is ML — classical rule-based expert systems and search algorithms are AI without being ML. In modern systems the two terms are often used interchangeably because nearly all current AI advances come from ML, particularly deep learning. The distinction matters in engineering reviews because ML systems require *data governance* and *validation regimes* that rule-based systems do not.

*General knowledge.*`
  },

  {
    id: "q-supervised-vs-unsupervised",
    category: "AI",
    chip: "Supervised uses labels; unsupervised finds structure in unlabelled data",
    question: "What's the difference between supervised and unsupervised learning?",
    answer: `In *supervised* learning the training data includes input-output pairs (e.g. drone camera images labelled "obstacle" or "clear"), and the model learns a mapping from inputs to those labels. In *unsupervised* learning the data has no labels and the algorithm must discover structure on its own, such as clusters of similar flight patterns or low-dimensional embeddings. Supervised learning generally yields higher task accuracy when labels are available, while unsupervised learning is useful for exploration, anomaly detection, and pre-training. A third category, *self-supervised* learning, generates labels from the data itself and underpins most modern foundation models.

*General knowledge.*`
  },

  {
    id: "q-what-is-neural-network",
    category: "AI",
    chip: "Layered network of weighted units that learns nonlinear functions",
    question: "What is a neural network?",
    answer: `A neural network is a parameterised mathematical function composed of layers of simple units ("neurons"), each computing a weighted sum of its inputs followed by a nonlinear activation. By stacking layers and adjusting the weights via gradient descent on a loss function, the network can approximate highly complex input-output relationships. Architectures vary by task: convolutional networks for images, recurrent or transformer networks for sequences, and graph networks for relational data. The biological analogy is loose — neural networks are best understood as differentiable function approximators trained by backpropagation.

*General knowledge.*`
  },

  {
    id: "q-what-is-deep-learning",
    category: "AI",
    chip: "ML using many-layered neural networks to learn hierarchical features",
    question: "What is deep learning?",
    answer: `Deep learning is a subfield of ML that uses neural networks with many layers ("deep" architectures) to learn hierarchical representations directly from raw data. Earlier ML pipelines depended on hand-engineered features; deep learning replaces this with end-to-end learning, where features and decisions are optimised jointly. Its rise since roughly 2012 is driven by three factors: large datasets, GPU/TPU compute, and architectural advances such as convolutions, residual connections, and transformers. Deep learning powers almost all current state-of-the-art results in computer vision, speech, and NLP.

*General knowledge.*`
  },

  {
    id: "q-what-is-reinforcement-learning",
    category: "AI",
    chip: "Agent learns a policy by maximising reward through trial and error",
    question: "What is reinforcement learning?",
    answer: `Reinforcement learning (RL) is a paradigm in which an agent learns to act in an environment by taking actions, observing states and rewards, and updating a policy to maximise expected cumulative reward. Unlike supervised learning, there are no ground-truth actions — the agent must *explore* to discover good behaviour while *exploiting* what it already knows. RL is well suited to sequential decision problems such as routing, control, and game playing, and has been combined with deep learning to produce systems like AlphaGo. Practical deployment requires careful reward shaping, simulation, and safety constraints, particularly in physical systems such as drones.

*General knowledge — see §5 for project use.*`
  },

  {
    id: "q-training-data-importance",
    category: "AI",
    chip: "Examples a model learns from; quality and coverage bound performance",
    question: "What is training data and why does it matter?",
    answer: `Training data is the set of examples a model uses to fit its parameters, and its quality, quantity, and representativeness directly bound what the model can learn. A model exposed only to clear-weather drone footage will fail in fog; one trained on biased labels will reproduce that bias. Standard practice is to split data into training, validation, and test sets to measure generalisation honestly, and to monitor *data drift* once the system is deployed. From an assurance perspective, training-data provenance and labelling protocols are as important as the model architecture itself.

*General knowledge — see §8.3 for project use.*`
  },

  {
    id: "q-what-is-overfitting",
    category: "AI",
    chip: "Model memorises training data and fails to generalise",
    question: "What is overfitting?",
    answer: `Overfitting occurs when a model fits the training data too closely — capturing noise and idiosyncrasies — and consequently performs poorly on unseen data. It typically appears as a large gap between training accuracy (high) and validation accuracy (lower), and is more likely with high-capacity models or limited data. Common mitigations include regularisation (e.g. weight decay, dropout), data augmentation, early stopping, and cross-validation. The complementary failure, *underfitting*, occurs when the model is too simple to capture the underlying pattern at all.

*General knowledge.*`
  },

  {
    id: "q-model-vs-algorithm",
    category: "AI",
    chip: "Algorithm is the procedure; model is the trained artefact it produces",
    question: "What's the difference between a model and an algorithm?",
    answer: `An *algorithm* is a procedure — for example, stochastic gradient descent or the random-forest training routine — that specifies how to learn from data. A *model* is the concrete artefact produced by running that algorithm on a dataset: a particular set of weights, tree splits, or parameters that can make predictions on new inputs. The same algorithm can produce many different models depending on the data and hyperparameters. In deployment we ship the model; in reproducibility audits we must also document the algorithm, data, and training configuration that produced it.

*General knowledge.*`
  },

  {
    id: "q-what-is-computer-vision",
    category: "AI",
    chip: "AI subfield that extracts information from images and video",
    question: "What is computer vision?",
    answer: `Computer vision is the area of AI concerned with extracting structured information from images and video — tasks such as classification, object detection, segmentation, depth estimation, and tracking. Modern computer vision is dominated by deep convolutional and transformer-based networks trained on large labelled image datasets. For aerial robotics it underpins obstacle detection, landing-zone identification, and visual-inertial odometry. Robustness to lighting, weather, motion blur, and adversarial conditions is the main engineering challenge, and is typically addressed through diverse training data and sensor fusion.

*General knowledge — see §5 for project use.*`
  },

  {
    id: "q-what-is-nlp",
    category: "AI",
    chip: "AI for understanding and generating human language",
    question: "What is natural language processing (NLP)?",
    answer: `Natural language processing (NLP) is the branch of AI that enables computers to understand, generate, and reason about human language across tasks like translation, summarisation, classification, and question answering. Contemporary NLP is built on transformer-based large language models (LLMs) trained on very large text corpora using self-supervised objectives. These models can be adapted to specific domains via fine-tuning or retrieval-augmented generation. In an engineering context NLP is useful for operator interfaces, log analysis, and assistant chatbots — including the one answering this question.

*General knowledge.*`
  },

  {
    id: "q-ai-in-valthr",
    category: "AI",
    chip: "Used for collision avoidance, fleet routing, and anomaly detection",
    question: "Where in the Valthr project is AI used?",
    answer: `The Valthr drone-delivery system uses AI in three principal places. First, *collision avoidance* relies on computer-vision and sensor-fusion models that detect obstacles and other airspace users in real time onboard each drone (§5). Second, *fleet routing optimisation* uses learned and heuristic methods to assign deliveries and plan paths across the fleet under wind, battery, and airspace constraints (§5). Third, *anomaly detection* models monitor telemetry and operational logs to flag failing components or unusual flight behaviour before they cause incidents (§8.3). Each subsystem is bounded by deterministic safety logic so that an AI failure cannot by itself cause an unsafe action.

*General knowledge — see §5 and §8.3 for project use.*`
  },

  {
    id: "r-what-is-llm",
    category: "AI",
    chip: "LLM basics",
    question: "What is a large language model (LLM)?",
    answer: `A **large language model (LLM)** is a neural network — typically a transformer with billions of parameters — trained on massive text corpora to predict the next token given prior context. Through that simple objective at scale, LLMs acquire emergent capabilities including summarisation, translation, code generation, and conversational reasoning. Modern systems (GPT-4, Claude, Gemini) extend this with instruction tuning and RLHF so the raw next-token predictor behaves as a helpful assistant. *General knowledge.*`
  },

  {
    id: "r-what-is-transformer",
    category: "AI",
    chip: "Transformer architecture",
    question: "What is a transformer (in AI)?",
    answer: `The **transformer** is a neural network architecture introduced by Vaswani et al. in *"Attention Is All You Need"* (2017). Its core innovation is **self-attention**, which lets every token in a sequence attend to every other token in parallel, replacing the sequential recurrence of RNNs. This parallelism enables training on huge corpora across many GPUs and underpins essentially every modern LLM, including GPT, Claude, and Gemini. *General knowledge.*`
  },

  {
    id: "r-what-is-embedding",
    category: "AI",
    chip: "Embeddings explained",
    question: "What is an embedding (in NLP)?",
    answer: `An **embedding** is a dense vector of real numbers (typically a few hundred to a few thousand dimensions) that represents the semantic meaning of a word, sentence, or document. Tokens or texts with similar meaning end up close together in the embedding space, so cosine similarity becomes a usable proxy for semantic similarity. Embeddings power semantic search, clustering, and the retrieval step of RAG pipelines. *General knowledge.*`
  },

  {
    id: "r-what-is-token",
    category: "AI",
    chip: "Tokens in LLMs",
    question: "What is a token (in LLMs)?",
    answer: `A **token** is the atomic unit an LLM actually reads and writes — usually a sub-word fragment produced by a tokeniser such as Byte-Pair Encoding (BPE) or SentencePiece. A common English word is roughly one token, while rare words split into several (e.g. *"Valthr"* might become *"Val"* + *"thr"*). Token counts matter because both context-window limits and API pricing are measured in tokens, not characters. *General knowledge.*`
  },

  {
    id: "r-what-is-context-window",
    category: "AI",
    chip: "Context window",
    question: "What is a context window?",
    answer: `The **context window** is the maximum number of tokens an LLM can attend to in a single forward pass — covering the system prompt, conversation history, retrieved documents, and the model's own reply. Modern frontier models support windows from 128k tokens up to 1M+ (Gemini 2.5). Once the window is exceeded the oldest tokens must be truncated or summarised, which is why long chats or large document sets typically rely on RAG instead of raw stuffing. *General knowledge.*`
  },

  {
    id: "r-what-is-fine-tuning",
    category: "AI",
    chip: "Fine-tuning",
    question: "What is fine-tuning?",
    answer: `**Fine-tuning** is the process of taking a pre-trained LLM and continuing training on a smaller, domain-specific dataset to specialise its behaviour or knowledge. Techniques range from full-parameter fine-tuning to parameter-efficient methods like **LoRA** (Low-Rank Adaptation), which trains only small adapter matrices. For a focused chatbot like Valthr's, RAG over a curated knowledge base is usually cheaper and more maintainable than fine-tuning, which is why this site uses retrieval rather than a custom-trained model. *See \`server.js\` retrieval pipeline.*`
  },

  {
    id: "r-what-is-prompt-engineering",
    category: "AI",
    chip: "Prompt engineering",
    question: "What is prompt engineering?",
    answer: `**Prompt engineering** is the discipline of crafting inputs to an LLM so it produces reliable, well-formatted, on-task outputs without retraining the model. Common techniques include role assignment ("you are a research assistant"), few-shot examples, chain-of-thought instructions, and explicit output schemas. The Valthr chatbot's system prompt constrains tone, scope (drone-delivery / project context), and citation format — that prompt is itself an exercise in prompt engineering. *See system prompt in \`server.js\`.*`
  },

  {
    id: "r-what-is-rag",
    category: "AI",
    chip: "RAG pipeline",
    question: "What is RAG (retrieval-augmented generation)?",
    answer: `**Retrieval-Augmented Generation (RAG)** combines an LLM with an external knowledge store: at query time, relevant passages are retrieved (via embeddings or keyword search) and injected into the prompt so the model answers from grounded source material rather than parametric memory. This reduces hallucination, allows fresh information without retraining, and provides citation trails. The Valthr assistant uses a RAG pattern — the curated Q&A corpus is searched, top matches are passed to Gemini, and the model composes the final reply. *See Valthr chatbot retrieval flow.*`
  },

  {
    id: "r-what-is-hallucination",
    category: "AI",
    chip: "AI hallucination",
    question: "What is hallucination in AI?",
    answer: `A **hallucination** is when an LLM produces output that is fluent and plausible but factually wrong or unsupported — invented citations, fabricated statistics, or confident misstatements. The root cause is that LLMs optimise for next-token likelihood, not truth, so when knowledge is missing the model interpolates. Mitigations include RAG (grounding answers in retrieved sources), low temperature, explicit "say I don't know" instructions, and post-hoc verification — all of which the Valthr chatbot employs. *See Valthr safety prompt.*`
  },

  {
    id: "r-what-is-gemini",
    category: "AI",
    chip: "Gemini 2.5 Flash",
    question: "What is Gemini?",
    answer: `**Gemini** is Google DeepMind's family of natively multimodal LLMs — handling text, images, audio, and video in a single architecture. The line spans **Gemini Ultra / Pro / Flash** tiers, with **2.5 Flash** offering low-latency, cost-efficient inference and a long context window. The Valthr research-assistant chat path uses **Gemini 2.5 Flash** specifically because its speed-per-token suits an interactive Q&A UI while remaining capable enough for grounded retrieval-augmented answers. *Used in the Valthr AI chat path.*`
  },

  {
    id: "r-llm-vs-search-engine",
    category: "AI",
    chip: "LLM vs search engine",
    question: "What is the difference between an LLM and a search engine?",
    answer: `A **search engine** retrieves existing documents ranked by relevance — it returns *links* to information someone else wrote. An **LLM** generates new text token-by-token from learned statistical patterns, so it can synthesise, summarise, and reformat — but it has no inherent notion of source or freshness. The two are complementary: RAG systems like Valthr's chatbot use retrieval (search-engine-style) to ground an LLM's generation, getting recall plus fluent synthesis. *General knowledge.*`
  },

  {
    id: "r-why-temperature",
    category: "AI",
    chip: "Temperature 0.2",
    question: "Why do LLMs have a \"temperature\" setting?",
    answer: `**Temperature** rescales the probability distribution over the next token before sampling: high values (≈1.0) flatten it for diverse, creative output, while low values (→0) sharpen it toward the most likely token, yielding deterministic, focused answers. Valthr's chatbot runs at **temperature 0.2** because the goal is accurate, citation-faithful research assistance — not creative writing. Low temperature minimises drift, keeps phrasing aligned with the retrieved source material, and reduces hallucination risk for a BAPCO-grade evidence trail. *Configured in the Valthr chat backend.*`
  },

  {
    id: "s-ai-overview-valthr",
    category: "AI",
    chip: "AI across dispatch, avoidance, landing, anomaly detection",
    question: "How is AI used in the Valthr drone delivery system?",
    answer: `AI is woven through several layers of the Valthr platform. A central **AI-driven dispatch engine** assigns parcels to drones and optimises routes across the fleet, while **onboard computer-vision models** handle obstacle avoidance using forward-facing cameras. **AprilTag fiducial detection** provides precision landing at delivery stations, and **AI-based anomaly detection** monitors flight telemetry for early fault signals. Together these models let Valthr operate autonomously at scale rather than relying on manual piloting.

*Source: §5.1 and IR4.*`
  },

  {
    id: "s-ai-dispatch-decisions",
    category: "AI",
    chip: "Assigns parcels, routes, recharge slots across the fleet",
    question: "What does the AI dispatch platform decide?",
    answer: `The dispatch AI continuously decides **which drone takes which parcel**, **which corridor and altitude band to fly**, and **when to recharge or swap batteries**. It balances live demand, weather, no-fly zones and station capacity to keep the fleet productive while staying within Valthr's regulatory envelope. By optimising globally rather than per-drone, it raises utilisation and shortens delivery times across the network.

*Source: §5.1.*`
  },

  {
    id: "s-ai-obstacle-avoidance",
    category: "AI",
    chip: "Forward cameras + CV models detect and avoid obstacles",
    question: "How does AI handle obstacle avoidance on the drones?",
    answer: `Each Valthr drone carries **forward-facing cameras** feeding a real-time computer-vision model that detects birds, wires, masts and other aircraft in the flight path. The model runs **on the drone's onboard compute** so reactions happen in milliseconds without a cloud round-trip. When something is detected, the flight controller deviates, slows or holds until the path is clear, keeping operations safe in shared low-altitude airspace.

*Source: §5.1.*`
  },

  {
    id: "s-ai-precision-landing",
    category: "AI",
    chip: "AprilTag fiducials guide centimetre-accurate landings",
    question: "How does AI enable precision landing at stations?",
    answer: `Valthr stations are marked with **AprilTag fiducials** — printed visual codes that the drone's downward camera detects and decodes during approach. The vision model computes the tag's pose to give **centimetre-level position and orientation**, which the autopilot fuses with GPS/IMU to land precisely on the pad. This is essential for hitting the parcel-handling slot and for safe battery swaps at automated stations.

*Source: §5.1.*`
  },

  {
    id: "s-ai-anomaly-detection-ir4",
    category: "AI",
    chip: "IR4: spots abnormal telemetry before failures escalate",
    question: "What is anomaly detection in this project (IR4)?",
    answer: `Anomaly detection (IR4) is an AI layer that watches **drone telemetry** — vibration, current draw, motor RPM, GPS quality, etc. — for patterns that deviate from healthy baselines. When a model flags an anomaly, Valthr can ground the drone, route around a failing component or trigger maintenance before an in-flight failure occurs. It turns operational data into a **predictive safety net** for the fleet.

*Source: IR4.*`
  },

  {
    id: "s-ai-model-drift-risk",
    category: "AI",
    chip: "Risk C1: live conditions diverge from training distribution",
    question: "Why is \"model drift\" a risk for the project (§8.3 #C1)?",
    answer: `Model drift means the AI's accuracy degrades as the **real world diverges from its training data** — new building sites, drone variants, seasonal lighting, fresh obstacle types. For Valthr this could quietly erode obstacle-avoidance or anomaly-detection performance without an obvious failure. The report therefore tracks drift as Risk C1 and requires periodic retraining and live performance monitoring to keep models aligned with current operations.

*Source: §8.3 #C1.*`
  },

  {
    id: "s-ai-false-positives-risk",
    category: "AI",
    chip: "Risk C3: phantom obstacles cause needless aborts and delays",
    question: "What are AI false positives and why do they matter for drones (§8.3 #C3)?",
    answer: `A false positive is when the AI **flags a problem that isn't real** — e.g. obstacle avoidance braking for a shadow, or anomaly detection grounding a healthy drone. While safer than missed detections, false positives still cause aborted deliveries, wasted battery and lost SLA performance. Risk C3 in §8.3 calls for tuning thresholds and human-in-the-loop review so Valthr stays both safe and economically viable.

*Source: §8.3 #C3.*`
  },

  {
    id: "s-ai-explainability-risk",
    category: "AI",
    chip: "Risk C8: hard to justify decisions to regulators and auditors",
    question: "Why does the report flag \"low AI explainability\" as a risk (§8.3 #C8)?",
    answer: `Low explainability means it's hard to say **why** a neural network avoided an obstacle, rerouted a drone or flagged an anomaly. For a regulated aviation operation, that's a problem: incident investigators, EASA and insurers will ask for justification, and "the model said so" isn't acceptable. Risk C8 therefore pushes Valthr to log inputs, capture model confidence and use interpretable surrogates so decisions can be **audited after the fact**.

*Source: §8.3 #C8.*`
  },

  {
    id: "s-ai-training-data",
    category: "AI",
    chip: "Flight imagery, AprilTag captures, telemetry, route history",
    question: "What training data does the AI need?",
    answer: `Valthr's models need **labelled flight imagery** (obstacles, weather, lighting variants), **AprilTag captures** at varied angles and distances for landing, **telemetry traces** of healthy and faulty drones for anomaly detection, and **historical dispatch records** for routing optimisation. Data must come from the actual operating environment — Faroese terrain, weather and infrastructure — to avoid drift. Curation, labelling and version control of this dataset are core MLOps work for the project.

*Source: §5.1 and §8.3 (general project context).*`
  },

  {
    id: "s-ai-edge-vs-cloud-ir3",
    category: "AI",
    chip: "IR3: latency and link loss force on-drone inference",
    question: "Why do drones run AI on-board (edge) instead of in the cloud (IR3)?",
    answer: `Obstacle avoidance and landing must react in **tens of milliseconds**, far faster than a mobile-network round-trip can guarantee — and Faroese routes can lose connectivity entirely over open water. Running inference **on the drone** keeps safety-critical decisions local and resilient to link loss. The cloud still handles fleet-level dispatch and model training, where higher latency is acceptable; this split is exactly what IR3 calls for.

*Source: IR3 and §5.1.*`
  },

  {
    id: "s-ai-testing-validation",
    category: "AI",
    chip: "Sim, closed-range flights, shadow mode, then staged rollout",
    question: "How is the AI tested / validated before deployment?",
    answer: `Models are first evaluated in **simulation and on held-out datasets**, then flown on **closed test ranges** with safety pilots. Promising versions run in **shadow mode** on live flights — predicting alongside the production model without acting — so accuracy can be compared on real Faroese conditions. Only after passing those gates and a staged rollout does a model take command, with continuous monitoring to catch drift or false-positive spikes.

*Source: §5.1 and §8.3 (general project context).*`
  },

  {
    id: "s-ai-not-an-llm",
    category: "AI",
    chip: "Task-specific CV and routing models, not a generative LLM",
    question: "Is the drone AI a generative LLM or something else?",
    answer: `It is **not** a large language model. Valthr uses **task-specific models**: convolutional / vision networks for obstacle detection and AprilTag pose estimation, time-series models for anomaly detection, and combinatorial optimisation (with ML components) for dispatch and routing. These are small, fast and deterministic enough to run on drone hardware and to be validated for aviation use — qualities a generative LLM does not offer for this safety-critical workload.

*Source: §5.1 (general project context).*`
  },

  {
    id: "t-what-is-a-drone",
    category: "Drones",
    chip: "Drone basics: UAV definition",
    question: "What is a drone?",
    answer: `A drone, formally called a UAV (Unmanned Aerial Vehicle), is an aircraft that flies without a human pilot onboard. It is controlled either remotely by an operator on the ground or autonomously by onboard software following a pre-programmed mission. Drones range from palm-sized hobbyist quadcopters to large fixed-wing military platforms with multi-meter wingspans. The broader system, including the aircraft, ground control station, and communication links, is often called a UAS (Unmanned Aircraft System).

*General knowledge.*`
  },

  {
    id: "t-autonomous-drone-meaning",
    category: "Drones",
    chip: "Autonomy levels in drones",
    question: "What does \"autonomous\" mean for a drone?",
    answer: `An autonomous drone can execute a mission without continuous human input, making decisions about navigation, obstacle avoidance, and task execution on its own. Autonomy exists on a spectrum: at low levels the drone follows a fixed waypoint list, while at high levels it perceives its environment, plans paths dynamically, and reacts to unexpected events. Full autonomy typically requires sensors (cameras, LiDAR, IMU), onboard compute, and AI models for perception and decision-making. In contrast, a "manual" drone needs a pilot's stick inputs in real time.

*General knowledge.*`
  },

  {
    id: "t-bvlos-explained",
    category: "Drones",
    chip: "BVLOS: flying past the operator’s sight",
    question: "What is BVLOS (Beyond Visual Line of Sight)?",
    answer: `BVLOS stands for Beyond Visual Line of Sight, meaning the drone operates beyond where the human pilot can directly see it. This is a key threshold in drone regulation because it unlocks long-range applications like delivery, pipeline inspection, and large-area mapping. BVLOS flights typically require special regulatory approval and rely on robust telemetry, detect-and-avoid systems, and redundant communication links. The opposite, VLOS, restricts flights to within the pilot's eyesight (often a few hundred meters).

*General knowledge.*`
  },

  {
    id: "t-quadcopter-vs-fixed-wing",
    category: "Drones",
    chip: "Multirotor vs fixed-wing trade-offs",
    question: "What's the difference between a quadcopter and a fixed-wing drone?",
    answer: `A quadcopter uses four rotors to generate lift and can hover, take off vertically, and maneuver in tight spaces, making it ideal for inspection and photography. A fixed-wing drone looks like a small airplane and generates lift from forward motion across its wings, giving it much greater range and endurance but no hover capability. Quadcopters are simpler to operate but are less efficient and typically fly 20-40 minutes; fixed-wing aircraft can stay airborne for hours. Hybrid VTOL designs combine both, taking off vertically then transitioning to efficient forward flight.

*General knowledge.*`
  },

  {
    id: "t-drone-navigation",
    category: "Drones",
    chip: "GPS, IMU, vision: how drones know where they are",
    question: "How do drones navigate?",
    answer: `Drones fuse data from multiple sensors to estimate their position and orientation. GPS (or GNSS) provides absolute global coordinates, while an IMU (Inertial Measurement Unit) tracks acceleration and rotation for short-term motion estimation. Computer vision techniques like visual odometry and SLAM (Simultaneous Localization and Mapping) let drones navigate indoors or in GPS-denied environments by tracking visual features. A flight controller runs a sensor fusion algorithm (commonly an Extended Kalman Filter) to combine these inputs into a single reliable state estimate.

*General knowledge.*`
  },

  {
    id: "t-industrial-drone-payload",
    category: "Drones",
    chip: "Typical payload capacity by drone class",
    question: "What payload can a typical industrial drone carry?",
    answer: `Payload capacity varies widely by drone class. Small industrial quadcopters (e.g., DJI Matrice-class) carry around 1-3 kg, enough for a high-resolution camera, thermal sensor, or LiDAR module. Mid-size heavy-lift platforms can carry 10-30 kg for tasks like agricultural spraying or parcel delivery. Specialized large drones used in cargo or defense contexts can lift hundreds of kilograms. Payload directly trades off against flight time, since heavier loads drain the battery faster.

*General knowledge.*`
  },

  {
    id: "t-drone-flight-time",
    category: "Drones",
    chip: "Battery endurance ranges",
    question: "How long can a drone fly on one battery charge typically?",
    answer: `A consumer or commercial quadcopter typically flies 20-40 minutes on a single LiPo battery charge. Fixed-wing electric drones can stay airborne for 1-3 hours due to their aerodynamic efficiency, and gas/hybrid-powered platforms can reach 5+ hours. Endurance depends heavily on payload weight, wind conditions, flight speed, and battery chemistry. Battery energy density is the dominant constraint, which is why swappable batteries and tethered or solar designs are active areas of development.

*General knowledge.*`
  },

  {
    id: "t-drone-swarm-fleet",
    category: "Drones",
    chip: "Coordinated multi-drone operations",
    question: "What is a drone swarm or fleet?",
    answer: `A drone swarm is a group of drones that operate together in a coordinated way, often sharing information and decision-making to accomplish a collective task. Swarms can be centrally controlled from a single ground station or use decentralized algorithms where each drone makes local decisions based on its neighbors (inspired by flocking behavior). A "fleet" is a looser term, usually referring to a managed set of drones (e.g., a delivery company's aircraft) without necessarily acting in tight coordination. Swarms are used in light shows, military reconnaissance, and large-scale mapping.

*General knowledge.*`
  },

  {
    id: "t-no-fly-zone-geofence",
    category: "Drones",
    chip: "Geofencing and restricted airspace",
    question: "What's a no-fly zone or geofence?",
    answer: `A no-fly zone is a geographic area where drone flight is prohibited or restricted, such as around airports, military bases, prisons, or major events. A geofence is the software implementation of this concept: a virtual boundary defined by GPS coordinates that the drone's firmware enforces by refusing to take off, blocking entry, or auto-landing. Most major manufacturers (e.g., DJI) ship drones with built-in geofence databases that update over the air. Operators with proper authorization can sometimes request temporary unlocks.

*General knowledge.*`
  },

  {
    id: "t-return-to-home",
    category: "Drones",
    chip: "Automatic safe-return failsafe",
    question: "What's a drone's \"return-to-home\" feature?",
    answer: `Return-to-home (RTH) is a safety feature where the drone automatically flies back to its takeoff location and lands, without needing pilot input. It is triggered by events like loss of radio signal, low battery, or a manual button press by the operator. The drone uses its recorded home GPS coordinate, climbs to a safe altitude to clear obstacles, and follows a direct path back. More advanced systems use stored maps or vision-based obstacle avoidance during the return flight.

*General knowledge.*`
  },

  {
    id: "t-drone-industries-at-scale",
    category: "Drones",
    chip: "Sectors with mature drone deployment",
    question: "What industries already use drones at scale?",
    answer: `Drones are now operationally embedded in several industries. Agriculture uses them for crop spraying, multispectral health monitoring, and yield estimation. Energy and infrastructure companies use them to inspect power lines, pipelines, wind turbines, and cell towers, replacing dangerous manual climbs. Logistics firms (Amazon Prime Air, Zipline, Wing) operate delivery drones, especially for medical supplies in remote regions. Defense and public safety remain large users, covering ISR (intelligence, surveillance, reconnaissance), search and rescue, and policing.

*General knowledge.*`
  },

  {
    id: "t-drone-global-regulation",
    category: "Drones",
    chip: "CAAs and international drone rules",
    question: "How are drones regulated globally?",
    answer: `Drone regulation is set nationally, with each country's Civil Aviation Authority (CAA) defining the rules: the FAA in the US, EASA across the EU, the CAA in the UK, and equivalents like CASA (Australia) or DGCA (India). Common requirements include drone registration, remote pilot licensing, weight-based categories, altitude limits (often 120 m / 400 ft), and restrictions near airports and crowds. BVLOS, night flight, and flight over people typically require additional authorization. International bodies like ICAO publish guidance to harmonize standards, but rules still vary significantly between countries.

*General knowledge.*`
  },

  {
    id: "u-how-gps-works",
    category: "Drones",
    chip: "GPS basics: trilateration from satellite signals",
    question: "How does GPS work?",
    answer: `GPS (Global Positioning System) is a constellation of ~31 US satellites broadcasting precisely-timed signals. A receiver measures the travel time from at least four satellites and uses **trilateration** to solve for latitude, longitude, altitude, and clock offset. Standalone civilian GPS is typically accurate to 3-10 meters, limited by atmospheric delay, multipath, and satellite geometry (DOP). Higher accuracy requires augmentation such as SBAS, RTK, or PPP. *General knowledge.*`
  },

  {
    id: "u-gps-vs-gnss",
    category: "Drones",
    chip: "GPS is one GNSS; GNSS spans GPS, GLONASS, Galileo, BeiDou",
    question: "What's the difference between GPS and GNSS?",
    answer: `**GPS** is the specific US-operated satellite navigation system. **GNSS** (Global Navigation Satellite System) is the umbrella term covering all such systems: GPS, Russia's GLONASS, the EU's Galileo, China's BeiDou, plus regional systems like QZSS and NavIC. A multi-GNSS receiver tracks satellites from several constellations simultaneously, which improves availability in urban canyons and reduces fix time. Modern drones almost always use GNSS receivers, not GPS-only chips. *General knowledge.*`
  },

  {
    id: "u-gps-rtk",
    category: "Drones",
    chip: "RTK uses carrier-phase corrections for cm-level fixes",
    question: "What is GPS RTK (Real-Time Kinematic)?",
    answer: `RTK is a differential technique that achieves **centimeter-level positioning** by using the GNSS signal's carrier phase rather than just code timing. A stationary base station at a known location streams correction data to a moving rover, cancelling out atmospheric and satellite errors common to both. Once the integer ambiguities are resolved ("RTK fix"), accuracy is typically 1-2 cm horizontally. Drones use RTK for precise mapping, geo-referenced photogrammetry, and accurate landing on docks. *General knowledge.*`
  },

  {
    id: "u-apriltags",
    category: "Drones",
    chip: "Square fiducial markers for robust 6-DoF pose estimation",
    question: "What are AprilTag fiducial markers?",
    answer: `AprilTags are 2D square fiducial markers (similar to QR codes but simpler) developed at the University of Michigan for robotics. Each tag encodes a small ID via a binary pattern, and detection libraries return the tag's ID plus its full **6-DoF pose** relative to the camera. They are robust to rotation, partial occlusion, and varied lighting, which is why drones use them as landing pads or reference targets. Common families include tag36h11 and tagStandard41h12. *General knowledge.*`
  },

  {
    id: "u-lidar-on-drones",
    category: "Drones",
    chip: "Laser ranging for 3D point clouds and obstacle sensing",
    question: "What is LiDAR and do drones use it?",
    answer: `**LiDAR** (Light Detection and Ranging) measures distance by timing laser pulses reflected from surfaces, producing dense 3D point clouds. Drones use lightweight LiDAR units for surveying, vegetation penetration, powerline inspection, and SLAM in GPS-denied environments. Compared to cameras, LiDAR works in darkness and gives direct geometry without stereo computation, but it is heavier and more expensive. Solid-state and MEMS LiDARs (e.g., Livox, Velodyne Puck) have made drone integration practical. *General knowledge.*`
  },

  {
    id: "u-real-time-obstacle-avoidance",
    category: "Drones",
    chip: "Sense, perceive, plan, control loop using onboard sensors",
    question: "How do drones avoid obstacles in real time?",
    answer: `Drones combine **sensing** (stereo cameras, LiDAR, ToF, ultrasonic), **perception** (depth maps, occupancy grids, or learned object detectors), and **planning** (local trajectory planners like MPC or potential fields) running onboard at tens of Hz. The flight controller fuses these with IMU/GNSS state and adjusts the planned path or stops the vehicle. Algorithms like VIO and SLAM provide ego-motion estimates when GPS is weak. Latency, field of view, and minimum detectable object size are the main practical constraints. *General knowledge.*`
  },

  {
    id: "u-imu-explained",
    category: "Drones",
    chip: "Accelerometers + gyros (+ mag) measuring motion",
    question: "What is an IMU (Inertial Measurement Unit)?",
    answer: `An **IMU** is a sensor package combining 3-axis accelerometers and 3-axis gyroscopes (often plus a magnetometer, making it a 9-DoF unit). It measures linear acceleration and angular velocity at high rates (hundreds to thousands of Hz), which the flight controller integrates to track orientation and motion. IMUs drift over time, so they are fused with GNSS, vision, or barometers via Kalman or complementary filters. Every modern drone has at least one IMU as the core of its attitude estimator. *General knowledge.*`
  },

  {
    id: "u-battery-swap-vs-wireless-charging",
    category: "Drones",
    chip: "Swap = fast turnaround; wireless = simple but slower",
    question: "What's the difference between a battery swap and wireless charging for drones?",
    answer: `**Battery swap** systems mechanically exchange a depleted pack for a charged one in seconds to minutes, maximizing flight uptime but adding mechanical complexity and requiring spare batteries. **Wireless (inductive or contact) charging** keeps the same battery in the drone and tops it up while docked, simplifying the hardware but typically taking 30-90 minutes and stressing the cell with heat. For continuous-operations docks, swap stations win on duty cycle; for low-frequency missions, charging docks are cheaper and more reliable. See Valthr §5 for context on docked-drone operations. `
  },

  {
    id: "u-flight-controller",
    category: "Drones",
    chip: "Embedded autopilot running stabilization and navigation",
    question: "What is a flight controller (autopilot)?",
    answer: `A **flight controller** is the embedded computer that stabilizes the drone and executes navigation commands. It runs a real-time control stack: an inner loop fusing IMU data for attitude control, and an outer loop using GNSS/vision for position and waypoint following. Popular open-source stacks include **PX4** and **ArduPilot**, typically running on STM32-class MCUs; commercial drones use proprietary equivalents. The flight controller also handles failsafes (RTL, geofence) and talks to a companion computer for higher-level autonomy. *General knowledge.*`
  },

  {
    id: "u-payload-attach-release",
    category: "Drones",
    chip: "Mechanical mounts plus electronic release with safeties",
    question: "How is a drone's payload attached and released safely?",
    answer: `Payloads attach via standardized mechanical mounts (rails, dovetails, or quick-release plates) combined with electrical connectors for power and data (often a gimbal protocol like MAVLink or proprietary). Releasable payloads (delivery, sensors) use servo or solenoid latches with redundant locking and a software-armed release command. Safety features include weight-on-hook detection, geofenced release zones, and parachute or tethered descent for heavier drops. Center-of-gravity and total-mass limits must be respected so the autopilot's control authority is maintained. *General knowledge.*`
  },

  {
    id: "u-inspection-drone-sensors",
    category: "Drones",
    chip: "RGB, thermal, zoom, LiDAR, gas, plus nav sensors",
    question: "What sensors does an industrial inspection drone typically carry?",
    answer: `An industrial inspection drone usually pairs **navigation sensors** (RTK-GNSS, IMU, barometer, magnetometer, downward ToF/optical-flow) with a **mission payload** chosen for the asset. Common payloads: high-resolution **RGB cameras** with optical zoom for visual defects, **thermal (LWIR) cameras** for electrical hotspots and insulation loss, **LiDAR** for 3D models and clearance checks, and specialized sensors like **methane sniffers**, ultrasonic thickness gauges, or multispectral cameras. Obstacle-avoidance sensors (stereo or LiDAR) round out the suite for safe close-up flight. See Valthr §5 for context on inspection workflows. `
  },

  {
    id: "u-manual-assisted-autonomous",
    category: "Drones",
    chip: "Spectrum from stick input to full mission autonomy",
    question: "What's the difference between manual flight, assisted flight, and full autonomy?",
    answer: `In **manual** mode the pilot directly commands attitude or rates; the autopilot only stabilizes the airframe (e.g., acro/stabilize modes). In **assisted** mode (e.g., position hold, altitude hold, return-to-home, follow-me) the autopilot takes over GNSS-aided positioning while the pilot gives high-level inputs. **Full autonomy** means the drone executes a mission, including takeoff, waypoint navigation, perception-driven decisions, and landing, without continuous human control, often supervised remotely. The boundary is fuzzy and roughly maps to SAE-style autonomy levels. See Valthr §5 for context on autonomous docked operations. `
  },

  {
    id: "v-what-is-oil-refinery",
    category: "Industry",
    chip: "Oil refinery: industrial plant turning crude into fuels",
    question: "What is an oil refinery?",
    answer: `An oil refinery is a large industrial complex that processes **crude oil** into usable petroleum products through a chain of physical and chemical separation steps. The core process is *distillation*, where crude is heated and separated into fractions (gases, gasoline, kerosene, diesel, residue) by boiling point. Downstream units like crackers, reformers, and hydrotreaters then upgrade those fractions into higher-value, cleaner products. Refineries typically run 24/7 with thousands of interconnected pipes, vessels, and pumps. *General knowledge.*`
  },

  {
    id: "v-what-refineries-produce",
    category: "Industry",
    chip: "Outputs: gasoline, diesel, jet fuel, naphtha, LPG, asphalt",
    question: "What does a refinery actually produce?",
    answer: `Refineries produce a spectrum of products from a single barrel of crude. Light products include **LPG** (propane/butane), **gasoline** for cars, and **naphtha** used as petrochemical feedstock. Middle distillates include **kerosene/jet fuel** and **diesel** for transport and heating. Heavier outputs include **fuel oil**, **lubricants**, **bitumen/asphalt** for roads, and **petroleum coke**. The product mix is tuned to market demand and crude type. *General knowledge.*`
  },

  {
    id: "v-refinery-hazards",
    category: "Industry",
    chip: "Hazards: flammable vapors, high pressure, heat, toxics",
    question: "Why are refineries considered hazardous environments?",
    answer: `Refineries handle **flammable hydrocarbons** at high temperatures and pressures, so any leak or spark risks fire or explosion. Toxic gases such as **H2S** (hydrogen sulfide) and benzene pose acute health hazards even at low concentrations. Rotating equipment, hot surfaces, confined spaces, and working at height add mechanical and physical risks. Because of these compounding hazards, refineries operate under strict permit, PPE, and zoning regimes. *General knowledge.*`
  },

  {
    id: "v-what-is-bapco",
    category: "Industry",
    chip: "BAPCO: Bahrain Petroleum Company, national refiner",
    question: "What is BAPCO?",
    answer: `**BAPCO** is the *Bahrain Petroleum Company*, the national oil company of the Kingdom of Bahrain, founded in 1929. It operates the **Sitra refinery**, one of the oldest in the Gulf region, processing both domestic and imported crude. BAPCO covers the full chain: exploration, production, refining, and marketing of petroleum products. It is currently undergoing a major modernization program (BMP) to expand capacity and improve efficiency. *General knowledge.*`
  },

  {
    id: "v-fluid-catalytic-cracking",
    category: "Industry",
    chip: "FCC: cracks heavy oil into gasoline using hot catalyst",
    question: "What is fluid catalytic cracking (FCC)?",
    answer: `**Fluid Catalytic Cracking** is a core conversion process that breaks heavy, low-value gas oil molecules into lighter, high-value ones, mainly **gasoline** and **LPG olefins**. It uses a fine powdered **zeolite catalyst** that behaves like a fluid when aerated, circulating between a reactor (where cracking happens at ~500-550°C) and a regenerator (where coke is burned off the catalyst). FCC is one of the most economically important units in a modern refinery. *General knowledge.*`
  },

  {
    id: "v-control-room",
    category: "Industry",
    chip: "Control room: central nerve center monitoring all units",
    question: "What does a refinery control room do?",
    answer: `The control room is the refinery's **central nerve center**, where operators monitor and command every process unit through a **Distributed Control System (DCS)** like Honeywell Experion or Yokogawa CENTUM. Screens display thousands of live tags: temperatures, pressures, flows, levels, alarms. Operators adjust setpoints, respond to alarms, coordinate with field operators, and execute startup/shutdown sequences. It is staffed 24/7 because process upsets can escalate within minutes. *General knowledge.*`
  },

  {
    id: "v-permit-to-work",
    category: "Industry",
    chip: "PTW: formal authorization for hazardous tasks",
    question: "What is \"permit-to-work\" (PTW) and why does it matter?",
    answer: `A **Permit-to-Work** is a formal written authorization that must be issued before any non-routine or hazardous task can begin in a plant: hot work, confined-space entry, line-breaking, working at height, etc. It documents the hazards, required isolations, PPE, gas tests, and the people responsible. PTW ensures everyone involved has reviewed the risks and that incompatible activities are not happening simultaneously. It is a cornerstone of process safety management and is heavily audited after any incident. *General knowledge.*`
  },

  {
    id: "v-what-is-hse",
    category: "Industry",
    chip: "HSE: Health, Safety and Environment",
    question: "What does HSE stand for and what does it cover?",
    answer: `**HSE** stands for *Health, Safety and Environment*, the discipline that protects workers, the public, and the surroundings from operational harm. **Health** covers occupational illness (toxic exposure, noise, ergonomics). **Safety** covers preventing injuries and major accidents (fires, explosions, releases). **Environment** covers emissions, effluents, waste, and spills. In oil and gas, HSE is a board-level function with dedicated KPIs, incident reporting, and regulatory oversight. *General knowledge.*`
  },

  {
    id: "v-atex-zone",
    category: "Industry",
    chip: "ATEX: EU classification of explosive atmosphere areas",
    question: "What is an ATEX zone in industrial safety?",
    answer: `**ATEX** (from French *ATmosphères EXplosibles*) is the EU framework that classifies areas where explosive gas or dust atmospheres may occur. **Zone 0** is continuous presence, **Zone 1** is likely during normal operation, **Zone 2** is unlikely and short-lived (gas zones; dust uses 20/21/22). Equipment used in these zones must be certified to prevent ignition: no sparks, limited surface temperature, sealed enclosures. Most of a refinery's process areas are Zone 1 or Zone 2, which strongly constrains what phones, tablets, robots, or vehicles can enter. *General knowledge.*`
  },

  {
    id: "v-refinery-samples",
    category: "Industry",
    chip: "Samples: process fluids tested in lab for quality control",
    question: "What are typical \"samples\" in a refinery and why do they need to be transported?",
    answer: `A **sample** is a small physical quantity of a process fluid (crude, intermediate, or product) drawn from a sample point on a unit and sent to the lab for analysis. Common tests include density, sulfur, octane/cetane, distillation curve, water content, and trace metals. These results feed back into operating decisions: blending ratios, catalyst performance, product certification before export. Because the lab is centralized but sample points are scattered across kilometers of plant, samples must be physically transported — often dozens to hundreds per shift. *General knowledge.*`
  },

  {
    id: "v-manual-sample-transport-risk",
    category: "Industry",
    chip: "Manual transport: exposure, delays, chain-of-custody gaps",
    question: "Why does manual sample transport create risk and inefficiency?",
    answer: `Manual transport means an operator physically walks or drives sealed sample bottles — often hot, pressurized, or toxic — from sample points through hazardous zones to the lab. This exposes the carrier to **H2S, benzene, hot surfaces**, and traffic risk, and consumes operator time that could be spent on higher-value work. It also introduces **delays** (samples queue, get lost, or degrade in transit) and **chain-of-custody gaps**, weakening traceability for quality and incident investigations. Automating this transport is a recognized opportunity to improve both safety and lab turnaround time. *General knowledge.*`
  },

  {
    id: "v-digital-transformation-oilgas",
    category: "Industry",
    chip: "Digital transformation: IoT, AI, automation in O&G ops",
    question: "What is digital transformation in oil and gas operations?",
    answer: `**Digital transformation** in oil and gas means using **IoT sensors, cloud data platforms, AI/ML, robotics, and mobile apps** to modernize traditionally manual, paper-based operations. Examples include predictive maintenance on rotating equipment, digital twins of process units, computer-vision leak detection, autonomous inspection robots, and electronic permit-to-work. The goals are higher safety (fewer humans in hazardous zones), lower cost (less downtime, optimized energy), and better decisions (real-time data instead of weekly reports). National operators like BAPCO, Saudi Aramco, and ADNOC have all launched flagship digital programs. *General knowledge.*`
  },

  {
    id: "w-what-is-project-management",
    category: "PM-General",
    chip: "What is project management?",
    question: "What is project management?",
    answer: `**Project management** is the practice of planning, organising and controlling work to deliver a specific outcome within constraints of **time, cost, scope and quality**. Unlike ongoing "operations", a project is *temporary* — it has a defined start, end and goal. PMs coordinate people, budgets and risks, often using methodologies like PRINCE2, Agile or Waterfall. Valthr applies this on a 12-month timeline with a fixed CAPEX budget of **£191,980** and a defined deliverable: an autonomous drone delivery service for BAPCO.
*General knowledge.*`
  },

  {
    id: "w-what-is-a-stakeholder",
    category: "PM-General",
    chip: "What is a project stakeholder?",
    question: "What is a project stakeholder?",
    answer: `A **stakeholder** is any person or organisation affected by, interested in, or able to influence a project. They can be **internal** (team, sponsors, employees) or **external** (regulators, customers, suppliers, the public). Identifying them early lets PMs manage expectations and tailor communication — often via a **power-interest matrix** like Mendelow's. Valthr mapped its stakeholders (BAPCO, Bahrain CAA, technicians, residents) on Mendelow's matrix to prioritise engagement.
*General knowledge.*`
  },

  {
    id: "w-what-is-scope-creep",
    category: "PM-General",
    chip: "What is scope creep?",
    question: "What is scope creep and why is it a problem?",
    answer: `**Scope creep** is the gradual, often uncontrolled expansion of a project's requirements beyond what was originally agreed — new features, extra deliverables, "while you're at it" requests. It's a problem because every addition consumes budget and schedule that weren't planned for, jeopardising **cost, time and quality**. Mitigations include a formal change-control process and clearly written requirements baselines. Valthr flags scope creep as a key risk of heavy customer communication and controls it via PRINCE2-style stage tolerances.
*General knowledge.*`
  },

  {
    id: "w-agile-vs-waterfall",
    category: "PM-General",
    chip: "Agile vs Waterfall",
    question: "What's the difference between Agile and Waterfall?",
    answer: `**Waterfall** is a sequential approach: requirements → design → build → test → deploy, each phase finishing before the next begins. It suits projects with stable, well-understood requirements (e.g. construction, regulated hardware). **Agile** is iterative — work is broken into short cycles ("sprints") that produce working increments, with requirements allowed to evolve. Agile suits uncertain, fast-changing problems like software. Valthr blends both: a **Spiral lifecycle** for hardware milestones, with **Agile-Scrum sprints** inside each phase for software and iterative regulatory work.
*General knowledge.*`
  },

  {
    id: "w-what-is-a-sprint",
    category: "PM-General",
    chip: "What is a sprint?",
    question: "What is a sprint in Agile?",
    answer: `A **sprint** is a fixed, short time-box (typically **1–4 weeks**) in which an Agile team commits to completing a defined slice of work and delivering a potentially shippable increment. Each sprint follows a rhythm: planning → daily stand-ups → review → retrospective. It forces frequent feedback and limits how much scope can change mid-cycle. Valthr's plan runs **at least two concurrent sprints** managed via a Notion Kanban board, with burn-down charts shared with stakeholders and end-of-sprint verification testing.
*General knowledge.*`
  },

  {
    id: "w-what-is-a-gantt-chart",
    category: "PM-General",
    chip: "What is a Gantt chart?",
    question: "What is a Gantt chart?",
    answer: `A **Gantt chart** is a horizontal bar chart that visualises a project schedule — each bar is a task, its position shows start/end dates, and arrows show **dependencies** between tasks. It makes parallelism, slack and overall duration easy to see at a glance. Modern Gantt tools (MS Project, Smartsheet) also overlay milestones, resources and the critical path. Valthr's Gantt is large enough that it's split across **five figures** in the report, followed by a separate critical-path diagram.
*General knowledge.*`
  },

  {
    id: "w-what-is-critical-path",
    category: "PM-General",
    chip: "What is the critical path?",
    question: "What is the critical path of a project?",
    answer: `The **critical path** is the longest chain of dependent tasks through a project — it determines the **shortest possible total duration**. Tasks on it have **zero slack**: any delay to them delays the whole project. PMs identify it via Critical Path Method (CPM) analysis to focus risk-mitigation and resource attention. Valthr presents its critical path as a dedicated diagram (Figure 7) so the team knows which tasks cannot slip without pushing the 12-month delivery date.
*General knowledge.*`
  },

  {
    id: "w-what-is-a-risk-register",
    category: "PM-General",
    chip: "What is a risk register?",
    question: "What is a risk register?",
    answer: `A **risk register** is a structured log of identified project risks, each scored by **likelihood × impact** and paired with an **owner**, a **mitigation** strategy and a **contingency** plan. It is reviewed regularly so emerging risks are captured and closed risks retired. Common formats use a 5×5 heat-map to prioritise. Valthr maintains a risk register covering technical (drone failure), regulatory (CAA approval) and commercial risks, aligned with PRINCE2's risk-management theme.
*General knowledge.*`
  },

  {
    id: "w-capex-vs-opex",
    category: "PM-General",
    chip: "CAPEX vs OPEX",
    question: "What's the difference between CAPEX and OPEX?",
    answer: `**CAPEX** (capital expenditure) is one-off spending on long-life assets — hardware, vehicles, infrastructure — that get **depreciated/amortised** over their useful life. **OPEX** (operating expenditure) is recurring spending to run the business — salaries, electricity, maintenance, software subscriptions. The split matters for tax, accounting and pricing models. Valthr's economics show this clearly: **£191,980 total CAPEX** for the drone fleet and ground infrastructure, vs **£227,441/year OPEX** for ongoing operations, giving a per-mission cost of £12.86.
*General knowledge.*`
  },

  {
    id: "w-what-is-a-milestone",
    category: "PM-General",
    chip: "What is a milestone?",
    question: "What is a milestone in project management?",
    answer: `A **milestone** is a zero-duration marker on the schedule that signals a **significant event** — phase completion, a deliverable signed off, a regulatory approval granted, a go/no-go decision. Unlike tasks, milestones produce no work themselves; they are checkpoints for stakeholders to assess progress. They are usually shown as diamonds on a Gantt chart. Valthr's plan defines milestones such as CAA approval, prototype flight tests and final BAPCO handover, each tied to a stage-gate review.
*General knowledge.*`
  },

  {
    id: "w-deliverable-vs-requirement",
    category: "PM-General",
    chip: "Deliverable vs requirement",
    question: "What's the difference between a deliverable and a requirement?",
    answer: `A **requirement** specifies *what the project must do or satisfy* — a written statement of need, constraint or function (e.g. "drone must operate at 40 °C"). A **deliverable** is *the tangible output produced* that meets one or more requirements (e.g. the drone itself, a test report, a user manual). Requirements drive design; deliverables prove the design works. Valthr separates these clearly, with a tables-of-requirements section and named deliverables like **DV1: Stakeholder map** mapped back to source requirements.
*General knowledge.*`
  },

  {
    id: "w-what-is-roi",
    category: "PM-General",
    chip: "What is ROI?",
    question: "What is ROI (return on investment)?",
    answer: `**ROI** measures the financial return of an investment relative to its cost, usually as a percentage: **(Net Gain − Cost) ÷ Cost × 100%**. A positive ROI means the project earns more than it costs; the **payback period** complements ROI by showing *how quickly* costs are recovered. ROI is the headline metric used to justify funding to sponsors. For Valthr, ROI is built from the **£191,980 CAPEX** plus annual OPEX weighed against labour value recovered and per-mission savings vs manual delivery.
*General knowledge.*`
  },

  {
    id: "x-wifi-mesh-basics",
    category: "Tech",
    chip: "Wi-Fi mesh vs regular Wi-Fi",
    question: "What is Wi-Fi mesh and how is it different from regular Wi-Fi?",
    answer: `Wi-Fi mesh is a topology where multiple nodes (access points) cooperate as peers, relaying traffic for one another so coverage and resilience scale beyond a single router. Unlike a traditional star-shaped Wi-Fi network with one AP and many clients, mesh nodes self-organize, route around failed links, and extend reach without manual cabling. This makes it well-suited to mobile fleets and large outdoor sites where a single AP cannot cover the area. See Valthr §5.1 for our reference architecture.

*General knowledge.*`
  },

  {
    id: "x-lte-5g-overview",
    category: "Tech",
    chip: "LTE and 5G in brief",
    question: "What is LTE/5G in a few sentences?",
    answer: `LTE (4G) and 5G are cellular wireless standards operated by mobile carriers, providing wide-area IP connectivity to devices through licensed spectrum and base stations. 5G adds higher peak bandwidth, lower latency, and dense-device support (mMTC, URLLC) compared to LTE, plus mid-band and mmWave options. Both rely on carrier infrastructure, SIM-based authentication, and per-device data plans. They excel for mobility across large geographies but introduce dependency on the operator's network.

*General knowledge.*`
  },

  {
    id: "x-mesh-vs-5g-drones",
    category: "Tech",
    chip: "Why mesh over 5G for industrial drones",
    question: "Why might a project pick Wi-Fi mesh over 5G for industrial drones?",
    answer: `Wi-Fi mesh runs on unlicensed spectrum the operator owns and controls, avoiding carrier dependency, SIM logistics, and per-device data fees. It typically delivers lower and more deterministic latency on a controlled site, works in coverage gaps where cellular signal is weak (mines, warehouses, remote fields), and keeps operational data on-premises for sovereignty. 5G is great for wide-area mobility, but industrial drone fleets often operate in a bounded site where mesh wins on cost, control, and resilience. See Valthr §5.1.

*General knowledge.*`
  },

  {
    id: "x-edge-computing",
    category: "Tech",
    chip: "Edge computing defined",
    question: "What is edge computing?",
    answer: `Edge computing pushes compute and storage close to where data is generated - on devices, gateways, or local servers - rather than sending everything to a centralized cloud. This reduces round-trip latency, cuts bandwidth use, and lets workloads continue running when the WAN is unavailable. It is common in IoT, robotics, and real-time analytics. Reference Valthr §5.1 for the edge tier in our architecture.

*General knowledge.*`
  },

  {
    id: "x-edge-vs-cloud",
    category: "Tech",
    chip: "Edge vs cloud computing",
    question: "What's the difference between edge and cloud computing?",
    answer: `Cloud computing centralizes resources in large remote data centers, optimizing for elastic capacity, durability, and global reach but adding network round-trip latency. Edge computing distributes resources near the data source, optimizing for low latency, offline operation, and local data residency at the cost of less raw scale. In practice teams combine both: edge handles real-time control and pre-processing, cloud handles training, long-term storage, and aggregation. See Valthr §5.1 for the split we use.

*General knowledge.*`
  },

  {
    id: "x-latency-drones",
    category: "Tech",
    chip: "Latency and why it matters for drones",
    question: "What is latency and why does it matter for drones?",
    answer: `Latency is the time delay between a request being sent and a response being received, usually measured in milliseconds round-trip. For drones, control loops, collision avoidance, and video-based decisions are time-critical: a 200 ms delay can mean meters of travel before a command lands. Lower latency enables tighter autonomy, safer beyond-visual-line-of-sight operation, and better human-in-the-loop teleoperation. High or variable latency forces conservative behavior or onboard fallbacks.

*General knowledge.*`
  },

  {
    id: "x-bandwidth-basics",
    category: "Tech",
    chip: "Bandwidth defined",
    question: "What is bandwidth?",
    answer: `Bandwidth is the maximum rate at which data can be transferred over a network link, typically expressed in bits per second (Mbps, Gbps). It bounds throughput but does not directly determine latency - a high-bandwidth link can still be slow if RTT is large. Heavy payloads like 4K video, LiDAR streams, or model updates consume bandwidth quickly, often making it the practical bottleneck in fleet telemetry. Sizing bandwidth headroom is essential for stable real-time systems.

*General knowledge.*`
  },

  {
    id: "x-sla-defined",
    category: "Tech",
    chip: "Service Level Agreement explained",
    question: "What is an SLA (Service Level Agreement)?",
    answer: `An SLA is a contractual commitment between a service provider and customer that defines measurable performance targets - uptime, latency, response time - and remedies if those targets are missed. It typically distinguishes SLOs (internal objectives) from SLAs (the externally committed numbers, usually weaker for safety margin). Credits, refunds, or escalation paths apply when the provider falls short. SLAs are the basis for capacity planning and trust between vendor and customer.

*General knowledge.*`
  },

  {
    id: "x-five-nines",
    category: "Tech",
    chip: "\"Five nines\" availability meaning",
    question: "What does \"five nines\" availability mean?",
    answer: `"Five nines" means 99.999% availability, which translates to roughly 5.26 minutes of downtime per year, or about 26 seconds per month. Achieving it requires redundant hardware, automated failover, geographic distribution, and rigorous change management. It is common in telecom and financial systems but expensive; many SaaS products target three or four nines instead. The cost grows non-linearly with each additional nine.

*General knowledge.*`
  },

  {
    id: "x-wan-outage-resilience",
    category: "Tech",
    chip: "Surviving a WAN outage",
    question: "What is a WAN outage and how do you stay operational?",
    answer: `A WAN outage is a loss of wide-area connectivity between a site and the broader internet or cloud, often caused by ISP failure, fiber cuts, or upstream routing issues. Operational continuity comes from edge-first design: critical control loops run locally, data is queued and reconciled when the link returns, and a secondary uplink (cellular, satellite) provides failover. Local authentication caches and on-prem dashboards keep operators in control. The goal is graceful degradation, not full feature parity.

*General knowledge.*`
  },

  {
    id: "x-api-rate-limiting",
    category: "Tech",
    chip: "API rate limiting basics",
    question: "What is API rate limiting?",
    answer: `API rate limiting caps how many requests a client may make to a service in a given time window (e.g., 100 req/min per API key). It protects backends from overload, enforces fair use across tenants, and mitigates abuse like scraping or credential stuffing. Common algorithms include token bucket, leaky bucket, and fixed/sliding windows, and limits are usually signaled via HTTP 429 responses with \`Retry-After\` headers. Clients should implement exponential backoff and respect quota headers.

*General knowledge.*`
  },

  {
    id: "x-dns-plain-english",
    category: "Tech",
    chip: "DNS in plain English",
    question: "What is DNS in plain English?",
    answer: `DNS (Domain Name System) is the internet's phonebook: it translates human-friendly names like \`example.com\` into the IP addresses machines actually route to. Resolvers walk a hierarchy from root servers to TLD servers to authoritative servers, caching answers along the way for speed. Records like A, AAAA, CNAME, MX, and TXT serve different purposes (addresses, aliases, mail, metadata). DNS issues are a frequent root cause of "the internet is down" incidents.

*General knowledge.*`
  },

  {
    id: "y-what-is-cybersecurity",
    category: "Security",
    chip: "Cybersecurity in plain English",
    question: "What is cybersecurity?",
    answer: `Cybersecurity is the practice of protecting systems, networks, and data from unauthorised access, disruption, or damage. It spans technical controls (firewalls, encryption, access management), organisational controls (policies, training, audits), and physical controls (device security, facility access). The goal is usually framed as the **CIA triad**: Confidentiality, Integrity, and Availability. For a software vendor like Valthr, this maps onto the security and confidentiality obligations in clause 15.

*General knowledge.*`
  },

  {
    id: "y-what-is-encryption",
    category: "Security",
    chip: "Symmetric vs asymmetric encryption",
    question: "What is encryption, and what is the difference between symmetric and asymmetric?",
    answer: `Encryption transforms readable data (plaintext) into ciphertext that can only be reversed with the right key. **Symmetric** encryption (e.g. AES) uses one shared key for both encrypt and decrypt — fast, but key distribution is the hard part. **Asymmetric** encryption (e.g. RSA, ECC) uses a public/private key pair — slower, but solves key exchange and underpins TLS and digital signatures. In practice systems combine both: asymmetric to exchange a session key, then symmetric for the bulk traffic.

*General knowledge.*`
  },

  {
    id: "y-what-is-iso-27001",
    category: "Security",
    chip: "ISO 27001 information security standard",
    question: "What is ISO 27001?",
    answer: `ISO/IEC 27001 is the international standard for an **Information Security Management System (ISMS)**. Rather than prescribing specific tools, it requires an organisation to systematically identify risks, apply proportionate controls (drawn from Annex A), and continuously improve through internal audit and management review. Certification is issued by an accredited third party after a two-stage audit and is renewed on a three-year cycle with annual surveillance. It is widely used as a procurement baseline for software and SaaS vendors.

*General knowledge.*`
  },

  {
    id: "y-what-is-gdpr",
    category: "Security",
    chip: "GDPR / data protection law explained",
    question: "What is GDPR / data protection law in plain English?",
    answer: `The **General Data Protection Regulation (GDPR)** is the EU/UK law governing how personal data is collected, used, stored, and shared. It gives individuals rights (access, correction, deletion, portability) and places duties on **controllers** (who decide why data is processed) and **processors** (who handle it on their behalf). Key principles include lawful basis, purpose limitation, minimisation, and breach notification within 72 hours. Most non-EU jurisdictions (Bahrain PDPL, UAE, KSA) follow a broadly similar shape, which is reflected in Valthr's data-protection terms in clause 16.

*General knowledge.*`
  },

  {
    id: "y-what-is-data-residency",
    category: "Security",
    chip: "Data residency and sovereignty",
    question: "What is data residency and why does it matter?",
    answer: `**Data residency** is the requirement that data be physically stored, and often processed, within a specific country or region. It matters because many laws — Bahrain's PDPL, the UAE Data Protection Law, KSA's PDPL, and EU GDPR transfer rules — restrict where personal or regulated data can leave the jurisdiction. Beyond legality, residency affects latency, disaster-recovery design, and which government can compel disclosure. Procurement teams typically pin residency in the contract, which Valthr addresses through hosting region commitments alongside clause 16.

*General knowledge.*`
  },

  {
    id: "y-what-is-mitm-attack",
    category: "Security",
    chip: "Man-in-the-middle attacks",
    question: "What is a man-in-the-middle (MITM) attack?",
    answer: `A **man-in-the-middle attack** is when an attacker secretly relays or alters communication between two parties who believe they are talking directly. Common vectors include rogue Wi-Fi access points, ARP/DNS spoofing, and forged or stripped TLS certificates. Mitigations include enforced HTTPS with HSTS, certificate pinning, mutual TLS for service-to-service traffic, and using a VPN on untrusted networks. MITM is usually classed as a confidentiality and integrity threat against data in transit.

*General knowledge.*`
  },

  {
    id: "y-what-is-mfa",
    category: "Security",
    chip: "Multi-factor authentication",
    question: "What is multi-factor authentication (MFA)?",
    answer: `**MFA** requires two or more independent factors to log in, drawn from: something you *know* (password), something you *have* (phone, hardware key), and something you *are* (biometric). The point is that compromising one factor (a leaked password) is not enough on its own. Phishing-resistant forms — FIDO2/WebAuthn hardware keys or platform passkeys — are now preferred over SMS codes, which are vulnerable to SIM-swap. MFA on admin accounts is one of the highest-leverage controls a team can deploy.

*General knowledge.*`
  },

  {
    id: "y-what-is-security-audit",
    category: "Security",
    chip: "Security audits explained",
    question: "What is a security audit?",
    answer: `A **security audit** is a structured review of an organisation's controls against a defined benchmark — internal policy, ISO 27001, SOC 2, PCI-DSS, or a regulator's framework. Auditors gather evidence (configurations, logs, policies, interviews), test a sample of controls, and report findings with severity ratings and remediation guidance. Audits can be internal (first-party), customer-led (second-party), or independent (third-party, e.g. for certification). They are distinct from penetration tests, which are technical attacks rather than control reviews.

*General knowledge.*`
  },

  {
    id: "y-what-is-data-retention",
    category: "Security",
    chip: "Data retention policy",
    question: "What is a data retention policy?",
    answer: `A **data retention policy** defines how long each category of data is kept, where it lives during that period, and how it is securely destroyed afterwards. The policy balances legal duties (tax, employment, sector regulation), contractual commitments, and the data-protection principle that personal data should not be held longer than needed. Good policies include automated deletion, documented exceptions for legal hold, and proof of destruction. Retention and end-of-contract data return/deletion are typically pinned in the contract — for Valthr, alongside the termination terms in clause 19.

*General knowledge.*`
  },

  {
    id: "y-what-is-secure-by-design",
    category: "Security",
    chip: "Secure by design",
    question: "What is \"secure by design\"?",
    answer: `**Secure by design** means security requirements are baked into a product from the architecture stage rather than bolted on later. In practice this means threat modelling early, choosing safe defaults (encryption on, least privilege, MFA required), validating inputs, isolating trust boundaries, and making the secure path the easy path for users. It pairs with **secure by default** (the out-of-the-box configuration is the safe one) and with shift-left practices like SAST, dependency scanning, and code review in CI. UK NCSC and CISA both publish formal "secure by design" principles.

*General knowledge.*`
  },

  {
    id: "y-what-is-source-code-escrow",
    category: "Security",
    chip: "Source code escrow",
    question: "What is a source code escrow?",
    answer: `A **source code escrow** is a tripartite arrangement where a software vendor deposits source code, build instructions, and supporting materials with a neutral agent (e.g. NCC Group, Iron Mountain). The customer can claim release of the code only on defined trigger events — typically vendor insolvency, abandonment of the product, or material breach of support obligations. It lets a customer keep a critical system running if the vendor disappears, without giving them the IP up front. Escrow is a continuity control, often referenced alongside termination provisions like Valthr's clause 19.

*General knowledge.*`
  },

  {
    id: "y-authentication-vs-authorisation",
    category: "Security",
    chip: "AuthN vs AuthZ",
    question: "What is the difference between authentication and authorisation?",
    answer: `**Authentication (AuthN)** answers *"who are you?"* — verifying identity via password, MFA, certificate, or token. **Authorisation (AuthZ)** answers *"what are you allowed to do?"* — checking that the authenticated identity has permission for a given action or resource, usually via RBAC, ABAC, or policy engines. They run in that order: you authenticate once per session, then authorise on every sensitive request. Conflating the two is a common source of privilege-escalation bugs, which is why standards like OAuth 2.0 (authorisation) and OpenID Connect (authentication) are deliberately separated.

*General knowledge.*`
  },

  {
    id: "z-where-is-bahrain",
    category: "Region",
    chip: "Location: island nation in the Arabian Gulf",
    question: "Where is Bahrain?",
    answer: `Bahrain is a small island nation in the Arabian Gulf, situated off the eastern coast of Saudi Arabia and northwest of Qatar. It is an archipelago of around 30+ natural islands plus reclaimed land, with the main island connected to Saudi Arabia via the King Fahd Causeway. Its capital is Manama. As one of the GCC states, it sits at a strategic crossroads of regional trade and aviation routes.

*General knowledge.*`
  },

  {
    id: "z-bahrain-climate",
    category: "Region",
    chip: "Climate: hot, humid, dusty — drone-relevant",
    question: "What's the climate like in Bahrain, and why does it matter for drones?",
    answer: `Bahrain has a hot desert climate with extremely hot, humid summers and mild winters. Coastal humidity can exceed 80%, and ambient temperatures regularly surpass 40°C from June through September. For drone operations this matters significantly: high heat reduces battery performance and motor efficiency, humidity affects electronics and sensors, and airborne dust shortens component life. Mission planning in Bahrain therefore requires heat-resilient hardware and dust-tolerant designs.

*General knowledge.*`
  },

  {
    id: "z-what-is-gcc",
    category: "Region",
    chip: "GCC: six-country Gulf Cooperation Council",
    question: "What is the GCC?",
    answer: `The GCC (Gulf Cooperation Council) is a regional political and economic union founded in 1981, comprising six member states: Bahrain, Kuwait, Oman, Qatar, Saudi Arabia, and the United Arab Emirates. It coordinates policy on trade, defense, currency, and infrastructure across the Arabian Peninsula. The bloc represents one of the world's largest concentrations of hydrocarbon production and is increasingly investing in diversification, technology, and aviation.

*General knowledge.*`
  },

  {
    id: "z-bahrain-economy",
    category: "Region",
    chip: "Economy: oil, refining, finance, logistics",
    question: "What is Bahrain's economy based on?",
    answer: `Bahrain's economy historically rests on petroleum production and refining, but it is among the most diversified in the GCC. Major sectors include financial services (Bahrain is a long-established regional banking hub), aluminum smelting (ALBA), logistics, tourism, and ICT. The government's economic vision emphasizes reducing oil dependency and growing knowledge-economy sectors. Refining at BAPCO remains a cornerstone industrial activity.

*General knowledge.*`
  },

  {
    id: "z-what-is-bcaa",
    category: "Region",
    chip: "BCAA: Bahrain civil aviation regulator",
    question: "What is BCAA (Bahrain Civil Aviation Authority)?",
    answer: `The BCAA is Bahrain's national civil aviation regulator, responsible for overseeing aviation safety, airspace management, licensing, and airworthiness within the Kingdom. It governs both manned aviation and the use of unmanned aircraft systems (drones), issuing operational approvals and rules for commercial and recreational UAV flights. Operators of drones in Bahrain must comply with BCAA registration, permission, and airspace requirements. Specific regulatory details should be verified directly with BCAA publications.

*General knowledge.*`
  },

  {
    id: "z-drones-in-gcc",
    category: "Region",
    chip: "Drones: rapidly growing across the GCC",
    question: "Are drones common in Bahrain or the GCC?",
    answer: `Drone adoption is growing rapidly across the GCC, with the UAE and Saudi Arabia leading in commercial and government deployments — including inspection, surveying, security, and delivery trials. Bahrain participates in this trend, with applications in industrial inspection (notably energy and infrastructure), mapping, and public services. Regulatory frameworks across the region are maturing to support BVLOS and commercial use cases. Adoption details vary by country and specific permissions are required.

*General knowledge.*`
  },

  {
    id: "z-bapco-refining",
    category: "Region",
    chip: "BAPCO Refining: historic Bahrain refinery",
    question: "What does \"BAPCO Refining\" do?",
    answer: `BAPCO Refining operates the Bahrain Petroleum Company refinery at Sitra, one of the oldest refineries in the Middle East (dating to the 1930s). It processes crude oil into products such as gasoline, diesel, jet fuel, and fuel oil for domestic use and export. The site has been undergoing the BAPCO Modernization Programme (BMP), a major capital project to expand capacity, improve product slate, and meet stricter environmental and efficiency standards.

*General knowledge.*`
  },

  {
    id: "z-bahrain-summer-temps",
    category: "Region",
    chip: "Summer: 40–45°C+, heat-resilience needed",
    question: "What's the typical summer temperature in Bahrain?",
    answer: `Summer daytime temperatures in Bahrain typically range from 38°C to 45°C between June and September, with peaks occasionally exceeding 45°C and high humidity making the heat index even higher. Overnight lows often remain above 30°C. For drone and electronics deployment this means heat resilience is a hard requirement — thermal management, derated battery cycles, and shaded ground operations are standard considerations. Equipment rated only for temperate climates will degrade quickly.

*General knowledge.*`
  },

  {
    id: "z-bahrain-business-language",
    category: "Region",
    chip: "Languages: Arabic official, English for business",
    question: "What language is used for business in Bahrain?",
    answer: `Arabic is the official language of Bahrain, but English is widely used in business, finance, government communication, and aviation. Most professional documentation, contracts, and technical specifications are produced in English or bilingually. International firms operating in Bahrain typically conduct day-to-day business in English. Aviation and regulatory communications follow ICAO English-language norms.

*General knowledge.*`
  },

  {
    id: "z-bahrain-timezone",
    category: "Region",
    chip: "Time zone: Arabia Standard Time (UTC+3)",
    question: "What time zone is Bahrain in?",
    answer: `Bahrain operates on Arabia Standard Time (AST), which is UTC+3, and does not observe daylight saving time. This places it three hours ahead of UTC and shared with Saudi Arabia, Qatar, and Kuwait. Coordinating with European partners typically means a 1–2 hour offset, and with US Eastern time roughly 7–8 hours ahead. Stable year-round timing simplifies mission scheduling and remote operations.

*General knowledge.*`
  },

  {
    id: "z-sandstorms-dust",
    category: "Region",
    chip: "Dust events: frequent, drones must tolerate them",
    question: "Are there sandstorms or dust events that drones need to handle?",
    answer: `Yes — Bahrain and the wider Gulf region experience frequent dust and sand events, including seasonal shamal winds that can drastically reduce visibility and air quality. Fine particulates infiltrate motors, bearings, optics, and cooling intakes, accelerating wear and degrading sensor performance. Drones operating in the region typically need sealed components, filtered intakes where applicable, and rigorous post-flight cleaning regimes. Mission planning must monitor visibility and PM forecasts before flights.

*General knowledge.*`
  },

  {
    id: "z-bahrain-digital-transformation",
    category: "Region",
    chip: "National digital transformation agenda",
    question: "What is \"Bahrain's digital transformation\" agenda?",
    answer: `Bahrain's digital transformation agenda refers to the Kingdom's national push to modernize government services, industry, and infrastructure through cloud, AI, IoT, and automation — aligned with Bahrain Economic Vision 2030. The country was an early GCC adopter of "cloud-first" policy and hosts major hyperscaler regions. Industrial operators such as BAPCO reference this agenda when adopting digital twins, advanced analytics, robotic inspection, and drone-based monitoring as part of modernization. Specific program details are best confirmed via official Bahraini government sources.

*General knowledge.*`
  }

];
