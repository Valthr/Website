// qa.js — Precomputed Q&A pairs for the Valthr research assistant.
// Answers are grounded in the Valthr Group Report (assets/GROUP_01_Drone Delivery.pdf).
// See assets/js/chatbot.js for the consumer.
//
// Total entries: 200. Used as the autocomplete bank and the
// Gemini fallback bank when the API is unreachable.

window.VALTHR_QA = [

{
    id: 'comms',
    category: 'Architecture',
    chip: 'Will route plans be sent via Wi-Fi mesh or LTE/5G?',
    question: 'Will the delivery route plans be sent to the drones via Wi-Fi mesh or LTE/5G?',
    answer:
`**Wi-Fi mesh** was selected over LTE/5G for route uplink.

- **Lower cost** than a dedicated cellular rollout.
- Drones operate within **predefined air corridors** between the nine micro-base stations, so connectivity is only required along those corridors — full-area cellular coverage is unnecessary.
- This **reduces infrastructure** and also **improves safety** by limiting where drones can fly to communicate.

*Source: §5.1 High-level architecture.*`
  },

  {
    id: 'methodology-pm',
    category: 'Methodology',
    chip: 'Is Agile-Scrum the right project management methodology?',
    question: 'Is Agile-Scrum the most appropriate project management methodology for this proposal?',
    answer:
`**Yes — Agile-Scrum was selected over PRINCE2.**

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
    id: 'methodology-impl',
    category: 'Methodology',
    chip: 'What implementation methodology was chosen?',
    question: 'What implementation methodology was selected and why?',
    answer:
`The **Spiral model** was selected, with **V-model principles integrated into the prototyping and simulation phases**.

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
    id: 'capex-opex',
    category: 'Cost',
    chip: 'What is the CAPEX, OPEX, and cost per mission?',
    question: 'What is the estimated CAPEX, OPEX, and cost per mission?',
    answer:
`**Headline numbers** (from Activity-Based Costing, §7):

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
    id: 'routing',
    category: 'Architecture',
    chip: 'How does the routing / fleet optimiser work?',
    question: 'How does the routing algorithm and fleet optimiser work?',
    answer:
`The fleet management system is modelled as a **graph**:

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
    id: 'fleet',
    category: 'Architecture',
    chip: 'What is the fleet composition and station layout?',
    question: 'What is the fleet composition and where are the stations?',
    answer:
`**Fleet:** 23 drones total — **20 operational + 3 spares** for maintenance coverage.

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
    id: 'architecture',
    category: 'Architecture',
    chip: 'What does the system architecture look like?',
    question: 'What does the high-level system architecture look like?',
    answer:
`The system has **eight components**, split between software and hardware.

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
    id: 'risks',
    category: 'Risk',
    chip: 'What are the highest-priority risks and mitigations?',
    question: 'What are the highest-priority risks and how are they mitigated?',
    answer:
`Risks scored as **RPN = Probability × Impact** (each 1–5). The top-ranked items:

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
    id: 'kpis',
    category: 'Operations',
    chip: 'What KPIs and quality controls are defined?',
    question: 'What KPIs and quality assurance controls are in place?',
    answer:
`Five operational KPIs with named owners and a linked-risk reference:

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
    id: 'requirements',
    category: 'Process',
    chip: 'How were the project requirements developed?',
    question: 'How were the project requirements developed and prioritised?',
    answer:
`A two-step approach:

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
    id: 'critical-path',
    category: 'Schedule',
    chip: 'What is the critical path and longest activity?',
    question: 'What is the critical path and which activity is longest?',
    answer:
`All activities on the critical path carry **zero total float** — any slippage on these tasks delays the project end date.

**Longest individual activity on the critical path:** **Software Development and Validation**. It therefore warrants the closest schedule monitoring.

**Convergence point:** parallel work streams — payload, infrastructure setup, regulatory & compliance — feed into the critical path at the **integration and commissioning stage in week 22**, making this a key risk point where slippage in any feeder activity could impact the overall timeline.

*Source: §4.1 Critical Path Analysis.*`
  },

  {
    id: 'contract',
    category: 'Contract',
    chip: 'What are the key contract clauses (SLA, payment, warranty)?',
    question: 'What are the key contract clauses for SLA, payment, and warranty?',
    answer:
`**Payment schedule** (linked to objective deliverables):
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
    id: 'data-cyber',
    category: 'Contract',
    chip: 'What are the data ownership and cybersecurity terms?',
    question: 'What are the data ownership and cybersecurity terms?',
    answer:
`**Data ownership and residency (clause 16):**
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
    id: 'a-client-problem',
    category: 'Project',
    chip: 'What problem does Valthr solve?',
    question: 'In one paragraph, what is the client challenge Valthr is addressing at BAPCO?',
    answer: `BAPCO's refinery currently relies on **manual transport** of samples, tools, and critical items across a large, complex site. This creates **delays**, **operational inefficiencies**, and **unnecessary personnel exposure to hazardous areas**. Valthr proposes an autonomous drone delivery network to automate internal logistics, enabling rapid on-demand transport of lightweight payloads between refinery zones, improving speed, precision, safety, and supporting BAPCO's digital transformation strategy.

*Source: §1.1 Context and client challenge.*`
  },
  {
    id: 'a-system-footprint',
    category: 'Project',
    chip: 'Footprint and fleet size',
    question: 'What is the proposed operating footprint and fleet size for the drone network?',
    answer: `The proposed solution operates across the refinery's **2.5 × 2 km footprint** with a fleet of **20 electric drones** stationed at distributed micro-bases and coordinated through a central operations hub. The network supports lab sample transport, delivery of small tools and spare parts, and emergency deployment of safety equipment.

*Source: §1.2 Proposed project.*`
  },
  {
    id: 'a-dispatch-platform',
    category: 'Project',
    chip: 'How are tasks allocated?',
    question: 'How does the AI-driven dispatch platform allocate tasks to drones?',
    answer: `The AI-driven dispatch platform allocates tasks **dynamically** based on four factors:

- **Priority**
- **Payload requirements**
- **Battery status**
- **Proximity**

This optimises fleet utilisation in real time. The design also incorporates intrinsically safe components for hazardous zones, geofencing, redundant communications, and automated fail-safe protocols.

*Source: §1.2 Proposed project.*`
  },
  {
    id: 'a-mendelow-method',
    category: 'Stakeholders',
    chip: 'How was Mendelow’s matrix used?',
    question: 'How exactly did Valthr apply Mendelow’s matrix to identify stakeholders?',
    answer: `Valthr drafted a **stakeholder power-interest map** by researching and listing all stakeholders, with each position on the grid assigned by **team consensus**. Based on their position on Mendelow's Matrix, stakeholders were assigned a score from **1–10 for both power and interest** and recorded in a database. Internal stakeholders were shown in yellow and external in teal on the figure.

*Source: §2.1 Stakeholders (Figure 1).*`
  },
  {
    id: 'a-moscow-bands',
    category: 'Process',
    chip: 'MoSCoW scoring bands',
    question: 'What numerical bands does Valthr use for MoSCoW prioritisation?',
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
    id: 'a-requirement-categories',
    category: 'Requirements',
    chip: 'Five requirement categories',
    question: 'What are the five categories Valthr split requirements into, and which tables hold them?',
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
    id: 'a-fr17-vs-fr20',
    category: 'Requirements',
    chip: 'Geofencing vs GPS criticality',
    question: 'Why is FR17 (Geofencing) rated criticality 9 while its complexity is only 5, compared to FR20 (Precision GPS)?',
    answer: `**FR17 — Geofencing**: criticality **9**, complexity **5**. The drone *cannot* exit a predefined boundary; attempts are logged and flight aborted near the limit. The high criticality reflects safety/regulatory exposure inside a refinery, while complexity is moderate because the boundary check is a well-understood software guard.

**FR20 — Precision navigation (GPS)**: criticality **9**, complexity **7**. Positioning accuracy must be **≤1.0 m** for nominal operations. Higher complexity reflects sensor fusion / GPS-equivalent integration work.

Both are Must-haves, but geofencing is enforced as a deterministic boundary, whereas precision navigation requires harder real-world tuning.

*Source: §2.2 Tables of Requirements (FR17, FR20).*`
  },
  {
    id: 'a-fr-safety-musts',
    category: 'Requirements',
    chip: 'Top safety-critical FRs',
    question: 'Which functional requirements directly support emergency response and safe failure?',
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
    id: 'a-fr1-payload',
    category: 'Requirements',
    chip: 'What does FR1 say?',
    question: 'What is the payload capacity defined in FR1, and what is its priority?',
    answer: `**FR1 Payload Capacity** — criticality **6**, complexity **7**. The drone must carry **≥2.0 kg payload (assumption)** including a sealed sample box. As a Should-have it is important but not blocking, with complexity reflecting airframe and lift design trade-offs.

*Source: §2.2 Tables of Requirements (FR1).*`
  },
  {
    id: 'a-nfr-overview',
    category: 'Requirements',
    chip: 'What does NFR cover?',
    question: 'What does the Non-Functional Requirements (NFR) table cover at BAPCO?',
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
    id: 'a-nfr9-atex',
    category: 'Requirements',
    chip: 'ATEX Zone 2 (NFR9)',
    question: 'Why is NFR9 (ATEX compliance) rated 9/9 — what does it require?',
    answer: `**NFR9 Compliance with refinery ATEX safety standards** is rated criticality **9** and complexity **9** — the highest joint score in the NFR table. The drone must be **certified or assessed for Zone 2** where applicable, or flight paths must maintain a safe standoff. The high complexity reflects the difficulty of certifying battery-powered electronics for explosive atmospheres in a refinery; the high criticality reflects that any non-compliance is a hard regulatory blocker.

*Source: §2.2 Tables of Requirements (NFR9).*`
  },
  {
    id: 'a-ir-overview',
    category: 'Requirements',
    chip: 'Implementation Requirements (IR)',
    question: 'What kinds of items appear in the Implementation Requirements (IR) table?',
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
    id: 'a-cr-must-haves',
    category: 'Requirements',
    chip: 'Must-have contractual terms',
    question: 'Which contractual requirements are rated Must-have (criticality 9)?',
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
    id: 'a-dv-deliverables',
    category: 'Requirements',
    chip: 'Key deliverables (DV)',
    question: 'What are the deliverables Valthr commits to producing for this PoC?',
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
    id: 'a-fr32-audit-log',
    category: 'Requirements',
    chip: 'Why immutable mission logs?',
    question: 'What does FR32 require, and why is its complexity only 3?',
    answer: `**FR32 Mission audit log** — criticality **9**, complexity **3**. Every mission must produce an **immutable log** including mission ID, route, times, confirmations, and anomalies. The high criticality reflects regulatory and incident-investigation needs; complexity is low because append-only logging with hashing is a well-understood pattern, mostly implementation rather than research.

*Source: §2.2 Tables of Requirements (FR32).*`
  },

{
    id: 'b-wbs-definition',
    category: 'WBS',
    chip: 'What is the WBS and how is it organised?',
    question: 'What is the Work Breakdown Structure and how is it organised in this project?',
    answer: `The **WBS is a deliverable-oriented hierarchical decomposition** of the Proof of Concept (PoC), where each work package produces visible, verifiable outputs (analysis, plans, procedures).

- Requirements are grouped into **operational or functional clusters** with logical links preserved.
- **Level 2 branches** mirror the project's requirement sets and deployment lifecycle, so critical requirements are co-located.
- Example: geofencing spans operational definition and control logic; compliance and data governance are consolidated under data flows.

This structure applies **Separation of Concerns (SoC)** at the requirement level, treating safety, security, compliance, and lifecycle management as distinct streams.

*Source: §3.1 WBS rationale.*`
  },
  {
    id: 'b-wbs-soc-rationale',
    category: 'WBS',
    chip: 'Why apply Separation of Concerns to the WBS?',
    question: 'Why does the team apply Separation of Concerns (SoC) at the WBS level for refinery deployment?',
    answer: `For refinery deployment, treating **safety, security, compliance, and lifecycle management as distinct streams** prevents tangled requirement representation and **improves impact analysis and maintainability as constraints evolve**.

This matters in a refinery because constraints (intrinsic-safety zones, regulatory rules, data governance) shift over time, and a flat structure would make it hard to trace which work package owns each concern.

*Source: §3.1 WBS rationale.*`
  },
  {
    id: 'b-wbs-branch-1-5',
    category: 'WBS',
    chip: 'WBS branch 1.5 — Implementation, Software & Virtual Validation',
    question: 'What does WBS branch 1.5 (Implementation, Software & Virtual Validation) cover?',
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
    id: 'b-wbs-branch-1-7',
    category: 'WBS',
    chip: 'WBS branch 1.7 — Safety, QA & Risk Management',
    question: 'What sub-nodes does WBS branch 1.7 (Safety, QA & Risk Management) contain?',
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
    id: 'b-wbs-branch-1-8',
    category: 'WBS',
    chip: 'WBS branch 1.8 — Project Planning & Control',
    question: 'What is covered under WBS branch 1.8 (Project Planning & Control)?',
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
    id: 'b-wbs-branch-1-9',
    category: 'WBS',
    chip: 'WBS branch 1.9 — Future Development & Roadmap',
    question: 'What does WBS branch 1.9 (Future Development & Roadmap) contain?',
    answer: `Branch **1.9** captures the post-PoC pathway:

- **1.9.1** Technical gaps & limitations
- **1.9.2** Certification & approvals pathway
- **1.9.3** Pilot deployment plan
- **1.9.4** Scaling (fleet ops, expansion use cases)

*Source: §3.2 WBS diagram.*`
  },
  {
    id: 'b-critical-path-feeders',
    category: 'Schedule',
    chip: 'Which dependencies feed into the critical path?',
    question: 'Which parallel work streams feed into the critical path, and at what point?',
    answer: `The critical path runs through the longest activities, but several **parallel work streams feed in at the integration and commissioning stage**:

- **Payload** development
- **Infrastructure setup**
- **Regulatory & compliance**

These converge at **week 22**, which is the key point where delays from any feeder activity can also impact the overall timeline. **Software Development and validation** is the longest individual activity on the critical path and therefore warrants the closest schedule monitoring. All activities on the critical path carry **zero total float**.

*Source: §4.1 Critical Path Analysis.*`
  },
  {
    id: 'b-gantt-parts',
    category: 'Schedule',
    chip: 'How is the Gantt chart presented?',
    question: 'How is the project Gantt chart presented in the report?',
    answer: `The Gantt chart is split across **five figures** (Figures 2–6), each showing a part of the schedule, followed by a **Critical Path Diagram** in Figure 7. The split is required because the schedule is too long to render legibly on a single page.

*Source: §4 Project Gantt Chart and Dependencies.*`
  },
  {
    id: 'b-prince2-strengths',
    category: 'Methodology',
    chip: 'PRINCE2 strengths summarised',
    question: 'What are the main strengths of PRINCE2 as evaluated by the team?',
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
    id: 'b-prince2-weaknesses',
    category: 'Methodology',
    chip: 'Why was PRINCE2 not selected?',
    question: 'Why did the team reject PRINCE2 despite Bahrain government using it?',
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
    id: 'b-scrum-cadence',
    category: 'Methodology',
    chip: 'Sprint cadence and tooling specifics',
    question: 'What sprint cadence and tooling will the team use to run Agile-Scrum?',
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
    id: 'b-itil-role',
    category: 'Methodology',
    chip: 'What role does ITIL play?',
    question: 'What role does ITIL play alongside Agile-Scrum in this project?',
    answer: `**ITIL will support cost estimation and budgeting in software development** through a **configuration management database**, which **integrates effectively with Agile-Scrum**.

It is a complementary practice — Agile-Scrum drives delivery, ITIL underpins the cost/configuration discipline that Scrum alone does not prescribe.

*Source: §6.1 Selecting Project Management methodology.*`
  },
  {
    id: 'b-iterative-rejected',
    category: 'Methodology',
    chip: 'Why Iterative Enhancement was rejected',
    question: 'Why specifically was the Iterative Enhancement methodology rejected?',
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
    id: 'b-spiral-vmodel',
    category: 'Methodology',
    chip: 'Why combine Spiral with the V-model?',
    question: 'Why integrate the V-model into the Spiral methodology rather than using Spiral alone?',
    answer: `Spiral was selected for its **risk-driven emphasis**, which suits the safety and operational risks of deploying an autonomous drone delivery system in an industrial environment — and is also why **flying drones outside direct line of sight is illegal in Bahrain**.

To **maximise safety**, the team will integrate **main principles of the V model into the prototyping and simulation phases of the Spiral model**:

- Although this **increases implementation time and cost**, it ensures **testing and development are planned in parallel**.
- All possible issues are tackled through **exhaustive testing**.
- The combination is intended to facilitate the most efficient cooperation with **Bahrain's CAA**.

*Source: §6.2 Selecting Project Implementation methodology.*`
  },
  {
    id: 'b-pm-vs-impl-methodology',
    category: 'Process',
    chip: 'PM methodology vs Implementation methodology',
    question: 'What is the difference between the project management methodology and the implementation methodology in this report?',
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
    id: 'c-apriltag-landing',
    category: 'Architecture',
    chip: 'AprilTag landing precision',
    question: 'What does the drone use to land precisely on a station?',
    answer: `Each drone carries a **downward-facing camera** that detects **AprilTag fiducial markers** placed at the landing pad.

- AprilTags allow **centimetre-level landing precision**.
- This optical approach was chosen instead of high-precision GPS RTK, which the team deemed unnecessary because the AprilTags already give the required landing accuracy.

*Source: §5.1 High-level architecture.*`
  },
  {
    id: 'c-gps-accuracy',
    category: 'Architecture',
    chip: 'Why 5m GPS is enough (no RTK)',
    question: 'Why is approximately 5m GPS accuracy sufficient instead of high-precision GPS RTK?',
    answer: `In-flight navigation only needs to keep the drone roughly on the predefined air corridor, so **~5m GPS accuracy** is adequate.

The **landing phase** — which is where centimetre precision actually matters — is handled separately by the **AprilTag fiducial markers** detected by the downward-facing camera. Because that optical system already provides centimetre-level landing precision, **GPS RTK was deemed not required**, saving cost and complexity.

*Source: §5.1 High-level architecture.*`
  },
  {
    id: 'c-edge-vs-cloud',
    category: 'Architecture',
    chip: 'Edge vs cloud server trade-off',
    question: 'How does the team decide between an on-site edge server and a cloud server for fleet optimisation?',
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
    id: 'c-obstacle-avoidance-cameras',
    category: 'Architecture',
    chip: 'Forward vs downward camera roles',
    question: 'How does the drone handle obstacle avoidance, and what is each camera responsible for?',
    answer: `The drone uses **two distinct camera roles**:

- **Forward-facing cameras** feed the onboard computer for **local obstacle avoidance**. Short-range path adjustments are calculated **in real time, onboard** the drone.
- **Downward-facing camera** is used for **AprilTag detection** to enable centimetre-level landing precision.

Obstacle avoidance is therefore handled **locally** on the drone, independent of the cloud/edge fleet optimiser.

*Source: §5.1 High-level architecture.*`
  },
  {
    id: 'c-wireless-charging',
    category: 'Architecture',
    chip: 'Wireless charging vs battery swap',
    question: 'Why use wireless charging docks instead of manual battery swapping?',
    answer: `When a drone needs power, the **fleet optimiser routes it to a wireless charging dock**. Charging then occurs **autonomously, without manual battery replacement**.

The reason given in the report is straightforward: this **increases system autonomy** — no human operator needs to be present at the station to swap batteries, which is consistent with the wider goal of fully autonomous delivery operations at the refinery.

*Source: §5.1 High-level architecture.*`
  },
  {
    id: 'c-air-corridors',
    category: 'Architecture',
    chip: 'Predefined corridors vs free flight',
    question: 'Why do the drones fly within predefined air corridors instead of free-flight routing?',
    answer: `Drones operate **within predefined air corridors** rather than freely across the refinery. This decision drives several other architectural choices:

- **Connectivity** is only required along the corridors, so a low-cost **Wi-Fi mesh** suffices instead of LTE/5G.
- It **reduces infrastructure requirements**.
- It **improves safety** by limiting drone flight areas.
- In the graph model, **not all node pairs are connected**, which **reduces possible flight paths and simplifies airspace management**.

*Source: §5.1 High-level architecture; §5.2 Detailed architecture of the fleet management system.*`
  },
  {
    id: 'c-station-selection',
    category: 'Architecture',
    chip: 'How the 9 stations were chosen',
    question: 'How were the nine drone stations selected, and what criteria were used?',
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
    id: 'c-priority-dispatch',
    category: 'Architecture',
    chip: 'High vs low priority dispatch',
    question: 'How does dispatch differ between high-priority and low-priority deliveries?',
    answer: `The fleet optimiser uses **two distinct strategies** depending on priority:

- **High-priority deliveries:** the **nearest available (or soon-to-be-available) drone** is dispatched along the **shortest path** (pre-computed by Floyd-Warshall).
- **Low-priority deliveries:** the optimiser **evaluates all drones** and **inserts the task into the route that results in the smallest additional distance**, improving overall fleet efficiency.

In effect, urgent jobs minimise time-to-pickup, while non-urgent jobs minimise marginal route cost.

*Source: §5.2 Detailed architecture of the fleet management system.*`
  },
  {
    id: 'c-insertion-complexity',
    category: 'Architecture',
    chip: 'Complexity of low-priority insertion',
    question: 'What is the time complexity of the low-priority insertion step?',
    answer: `The report describes the insertion behaviour qualitatively: for a low-priority task, the optimiser **evaluates all drones** and inserts the task into the route that **results in the smallest additional distance**.

However, **the report does not specify** the formal time complexity of this insertion step, nor the data structures used to evaluate candidate insertion points. Testing is reported only at the level of correctness: "optimal insertion behaviour that aligns with human intuition."

*Source: §5.2 Detailed architecture of the fleet management system; §5.3 Output generated by the fleet management optimiser.*`
  },
  {
    id: 'c-matlab-prototype',
    category: 'Architecture',
    chip: 'MATLAB prototype scope',
    question: 'What does the MATLAB prototype actually demonstrate?',
    answer: `A **MATLAB prototype** was built using the **real coordinates of the nine stations**. Its GUI supports:

- **Route visualisation**
- **Playback**
- **Delivery queue simulation** with both **high- and low-priority requests**

Testing **confirmed correct shortest-path computation** and **optimal insertion behaviour that aligns with human intuition**. The report also points to a **YouTube video link** for a demonstration of the GUI output (Figure 10).

*Source: §5.3 Output generated by the fleet management optimiser.*`
  },
  {
    id: 'c-road-graph-extension',
    category: 'Architecture',
    chip: 'Future road-graph extension',
    question: 'How could the optimiser be extended to integrate delivery trucks in the future?',
    answer: `The report flags integrating **delivery trucks** as a future improvement. The proposed approach:

- Build a **second, road-based graph** alongside the existing air-corridor graph.
- Use **different edge weights** — specifically **driving time** rather than straight-line distance.
- The system could then **compare drone and truck availability** and **select the most efficient mode of delivery** for each request.

This naturally extends the existing architecture because edges weights are already noted as "easily modifiable."

*Source: §5.3 Output generated by the fleet management optimiser.*`
  },
  {
    id: 'c-edge-weights-modifiable',
    category: 'Architecture',
    chip: 'Edge weights and disconnected pairs',
    question: 'What do the graph edges represent, and why are not all node pairs connected?',
    answer: `In the fleet management graph:

- **Nodes** are the nine selected stations.
- **Edges** are **predefined air corridors**.
- **Edge weights** are based on **geographical distance**, and the report notes these can be **easily modified in the future** (for example, swapping in driving time for a road graph).

**Not all node pairs are connected.** The report gives a clear reason: this **reduces possible flight paths and simplifies airspace management**, which complements the safety benefit of confining drones to predefined corridors.

*Source: §5.2 Detailed architecture of the fleet management system.*`
  },

{
    id: 'd-abc-methodology',
    category: 'Cost',
    chip: 'Activity-Based Costing methodology',
    question: 'What is Activity-Based Costing (ABC) and why use it here?',
    answer: `Activity Based Costing (ABC) with time-driven operational rates was used to determine the cost per delivery mission, per activity. Costs were allocated to five primary activities (Infrastructure Setup, Drone Operations, Maintenance & Asset Support, Technology & Systems, Compliance & Safety) based on resource consumption patterns. Costs are split between CapEx and OpEx to clarify initial investment vs ongoing operational costs.\n\n*Source: §7.1 Costing Methodology.*`
  },
  {
    id: 'd-mission-breakdown',
    category: 'Cost',
    chip: 'Per-mission cost breakdown by activity',
    question: "What's the £/mission breakdown by activity?",
    answer: `Per-mission costs total **£12.86**: Infrastructure Setup £1.33, Drone Operations £5.13, Maintenance & Asset Support £2.99, Technology & Systems £1.65, and Compliance & Safety £1.77. This comprises £10.29 in OPEX and £2.57 in amortized CAPEX over a 5-year lifespan, based on 22,100 annual missions.\n\n*Source: §7.3 ABC Approach Executive Costing Summary.*`
  },
  {
    id: 'd-phase-1-setup',
    category: 'Cost',
    chip: 'Phase 1 Setup cost and activities',
    question: 'What does Phase 1 (Setup) cost and cover?',
    answer: `Phase 1: Setup runs Months 1–3 and costs **£248,840**. Key activities include fleet purchase, infrastructure build, BCAA registration, operator training, and system integration. This represents the bulk of upfront CapEx investment before operations commence.\n\n*Source: §7.5 Cost distribution by phase.*`
  },
  {
    id: 'd-phase-2-pilot',
    category: 'Cost',
    chip: 'Phase 2 Pilot Operations cost',
    question: 'What does Phase 2 (Pilot Operations) cost and cover?',
    answer: `Phase 2: Pilot Operations runs Months 4–6 and costs **£56,860**. Key activities include initial test missions, trialing of systems, safety validation, and staff competency verification. This phase ensures readiness before scaling to full operations.\n\n*Source: §7.5 Cost distribution by phase.*`
  },
  {
    id: 'd-phase-3-full-ops',
    category: 'Cost',
    chip: 'Phase 3 Full Operations annual cost',
    question: 'What does Phase 3 (Full Operations) cost annually?',
    answer: `Phase 3: Full Operations begins Month 6+ at an ongoing cost of **£227,441/year**. Key activities include ongoing mission delivery, maintenance, and compliance audits. This recurring OPEX matches the total annual operational expenditure across all five activity categories.\n\n*Source: §7.5 Cost distribution by phase.*`
  },
  {
    id: 'd-operator-supervisor-pay',
    category: 'Cost',
    chip: 'Drone operator and supervisor wages',
    question: 'How are drone operators paid (£15,360/yr) and supervisors?',
    answer: `Bahrain petroleum workers average 650 BHD (£1,280) monthly. Drone operators earn **£15,360 annually**, derived from this local wage benchmark. Supervisors earn **1.2x** that rate on an arbitrary basis, reflecting their additional oversight responsibilities.\n\n*Source: §7.2 ABC Approach Key Project Metrics and Assumptions.*`
  },
  {
    id: 'd-five-year-categories',
    category: 'Cost',
    chip: '5-year cost breakdown by category',
    question: "What's the 5-year category breakdown (Personnel/Hardware/Ops/IT/Compliance)?",
    answer: `Over 5 years: Personnel & Training **£558,960 (42.1%)**, Hardware Assets **£122,150 (9.2%)**, Operations & Maintenance **£270,842 (20.4%)**, Technology & IT **£182,000 (13.7%)**, and Compliance & Safety **£195,230 (14.7%)**. Personnel dominates due to recurring OPEX of £110,592/year, while Hardware is purely CapEx (£122,150).\n\n*Source: §7.4 Cost Breakdown By Category And Cost Drivers, Table 15.*`
  },
  {
    id: 'd-economic-viability',
    category: 'Cost',
    chip: 'Why £12.86/mission is economically viable',
    question: 'Why is £12.86/mission considered economically viable?',
    answer: `The ABC analysis yields a total cost of **£12.86 per delivery mission**, comprising £10.29 in OPEX and £2.57 in amortized CAPEX over a 5-year lifespan. Based on 22,100 annual missions, this demonstrates the economic viability of drone delivery compared to traditional manual methods. The low per-mission cost is enabled by high fleet utilization (1,326 operational hours annually) across 20 operational drones.\n\n*Source: §7.3 ABC Approach Executive Costing Summary.*`
  },

{
    id: 'e-order-of-precedence',
    category: 'Contract',
    chip: 'Order of precedence (clause 1)',
    question: 'If the Statement of Work and the supplier proposal disagree, which document wins?',
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
    id: 'e-fat-vs-sat',
    category: 'Contract',
    chip: 'FAT vs SAT difference',
    question: 'What is the difference between FAT and SAT?',
    answer: `Acceptance is **staged** in two steps (clauses 1 and 7):

| Test | Full name | Where it happens | Triggers |
|------|-----------|-----------------|----------|
| **FAT** | Field Acceptance Test | At the **Supplier facility** | Releases the **20%** payment milestone |
| **SAT** | Site Acceptance Test | On **Bapco site** | Starts the 30-day Pilot Period; releases **25%** after pilot pass; starts the **warranty clock**; activates the **24/7 incident channel** and the **≥99.5% SLA** |

Bapco has **10 business days** after each test to accept or issue a revision list, and **one re-test per phase is included at no cost**.

*Source: §10 Project Contract — clauses 1 & 7 (Acceptance testing and test artefacts).*`
  },
  {
    id: 'e-comms-framework',
    category: 'Contract',
    chip: 'Weekly / monthly / 24/7 comms (clause 2)',
    question: 'How are project meetings and communications structured under the contract?',
    answer: `Clause 2 sets a three-layer **communication framework**:

- **Weekly project meeting** — Supplier PM and Bapco PM (operational level).
- **Monthly steering meeting** — senior level (strategic oversight).
- **24/7 incident channel** — active **from SAT onwards**.

All key decisions are recorded in **meeting minutes forwarded to both parties within 48 hours**, and **formal notices are issued by email** to the main contacts.

*Source: §10 Project Contract — clause 2 (Contract governance and communication framework).*`
  },
  {
    id: 'e-scope-baseline',
    category: 'Contract',
    chip: 'Scope baseline & out-of-scope rule (clause 3)',
    question: 'What happens if Bapco asks for something that is not listed in the Statement of Work?',
    answer: `Clause 3 establishes the **scope baseline**. The Supplier must deliver everything in the SoW, including:

- Hardware
- Embedded firmware
- Ground systems
- Integration services

Anything not explicitly defined is **out of scope unless added via a Change Order**. So a new request from Bapco that isn't in the SoW must go through clause 6's **Change Request** process (with affected requirement IDs, cost, lead time, and risk updates) and receive a **signed Change Order from the project manager** before any work begins.

*Source: §10 Project Contract — clause 3 (Scope of work and deliverables baseline).*`
  },
  {
    id: 'e-rolling-plan-slippage',
    category: 'Contract',
    chip: 'Rolling 3-week plan & slippage notice (clause 4)',
    question: 'How early must the Supplier warn Bapco about a delay?',
    answer: `Under clause 4, the Supplier must:

- Deliver milestones aligned with the **approved Gantt chart**.
- Provide a **rolling 3-week plan each week**.
- Notify any **anticipated slippage at least 10 business days before the impacted milestone**.

The slippage notification must include the **root cause**, a **recovery plan**, and the **revised critical path**. This means Bapco gets a two-week-plus warning rather than learning about a delay on the milestone date itself.

*Source: §10 Project Contract — clause 4 (Delivery schedule and milestone integrity).*`
  },
  {
    id: 'e-pilot-period',
    category: 'Contract',
    chip: '30-day Pilot Period conditions (clause 8)',
    question: 'What does the system have to demonstrate during the 30-day Pilot Period?',
    answer: `Clause 8 defines the **Pilot Period** that follows SAT. Across the **30-day** window the system must demonstrate **all** of:

- **≥95% mission success**
- **Zero unresolved Severity-1 safety defects**
- **Documented compliance evidence**

If any condition fails, the Supplier must produce a **remedial action plan within 5 working days**, and the **Pilot Period restarts at Supplier cost**. Successful completion releases the **25% payment** linked to SAT pass / pilot achievement (clause 5).

*Source: §10 Project Contract — clause 8 (Pilot Period performance conditions).*`
  },
  {
    id: 'e-support-tiers',
    category: 'Contract',
    chip: 'L1 / L2 / L3 support tiers (clause 12)',
    question: 'What support tiers must the Supplier provide?',
    answer: `Clause 12 defines a tiered **maintenance and support** model:

- **L1 / L2 — remote support.** Handles basic queries and escalates to in-depth engineering support.
- **L3 — engineering support on demand.** Deep technical investigation and fixes.

Additionally, the Supplier must:

- Provide a **preventive maintenance schedule and checklists before SAT**.
- Include **mandatory maintenance in project cost estimates** (so it cannot be billed later as a surprise).

*Source: §10 Project Contract — clause 12 (Maintenance and support obligations).*`
  },
  {
    id: 'e-incident-timing',
    category: 'Contract',
    chip: 'Incident reporting 30s / 4h / 5d (clause 13)',
    question: 'How quickly must a drone crash or near-miss be reported and analysed?',
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
    id: 'e-warranty-start-replacement',
    category: 'Contract',
    chip: 'Warranty start at SAT & 14-day rule (clause 11)',
    question: 'When does the warranty start, and what if a repair takes too long?',
    answer: `Clause 11 ties warranty timing to acceptance and adds a **no-downtime guarantee** for long repairs:

- **Warranty start date: SAT acceptance** (not delivery, not FAT).
- **Drones:** 24 months **or** 3,000 flight-hours (whichever first).
- **Batteries:** 12 months **or** 500 cycles, with **≥80% capacity retention**.
- **Software:** patched for the SLA duration.

If a repair **exceeds 14 business days**, the Supplier must provide **field-repairable item access, off-site repairs, or temporary replacements free of charge** — Bapco is never left without working hardware while the Supplier diagnoses an item.

*Source: §10 Project Contract — clause 11 (Warranty and spares).*`
  },
  {
    id: 'e-confidentiality-survives',
    category: 'Contract',
    chip: 'Confidentiality survives indefinitely (clause 17)',
    question: 'How long does the supplier have to keep Bapco information confidential after the contract ends?',
    answer: `Under clause 17, confidentiality is **perpetual**:

- Client information is treated as confidential and used **only for contract purposes**.
- The obligation **survives indefinitely post-termination** — there is no expiry date.
- The Supplier **cannot publish case studies or press releases referencing Bapco** without **prior written consent**.

So even decades after the contract ends, the Supplier still cannot use Bapco's name in marketing or disclose project information.

*Source: §10 Project Contract — clause 17 (Confidentiality and publicity restriction).*`
  },
  {
    id: 'e-rfp-scoring-legend',
    category: 'RFP',
    chip: 'RFP scoring legend Y / EC / ES / NC / N',
    question: 'How are supplier responses scored in the RFP?',
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
    id: 'e-alternative-approaches',
    category: 'RFP',
    chip: 'Why suppliers may propose alternatives',
    question: 'Can a supplier propose an approach that differs from what the RFP describes?',
    answer: `Yes. §9.1 explicitly invites alternatives, with conditions:

> *"Suppliers may propose alternative approaches where these improve performance, reduce risk, or reduce lifecycle cost, provided that all critical requirements are met and any deviations clearly flagged."*

The mechanics in §9.2 reinforce this: any deviation must be **explicitly described in the Comments column** of the conformance table and **priced in Enhancement cost** if applicable. This lets Bapco still compare like-for-like via the weighted scoring while benefiting from supplier expertise and innovation.

*Source: §9.1 Project RFP — Purpose and vendor scope; §9.2 Supplier Response Instructions.*`
  },
  {
    id: 'e-implementation-requirements',
    category: 'RFP',
    chip: 'IR1-IR8 implementation requirements',
    question: 'What are the eight Implementation Requirements (IR1-IR8) that the supplier must meet?',
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
    id: 'e-supplier-bankruptcy-escrow',
    category: 'Contract',
    chip: 'Source code escrow on supplier insolvency',
    question: 'What happens to the software if the supplier goes bankrupt?',
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
    id: 'e-payment-holdback',
    category: 'Contract',
    chip: 'How much money is held back?',
    question: 'How much of the contract value is held back until the very end?',
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
    id: 'f-fr-01-payload',
    category: 'Requirements',
    chip: 'FR1 — Payload capacity (>=2.0 kg)',
    question: 'What does FR1 specify for payload capacity, and how is it rated?',
    answer: `**FR1 — Payload Capacity** sets the lifting requirement for the delivery drone.

- **Threshold:** Must carry **>=2.0 kg payload** (assumption) including the sealed sample box.
- **Criticality:** 6
- **Compliance:** 7
- **Rationale:** The 2.0 kg figure is an assumed envelope that covers a sealed refinery sample box plus minor margin; the moderate criticality (6) reflects that payload is dimensioning but not life-safety critical, while the higher compliance score (7) shows confidence that off-the-shelf airframes can meet it.

*Source: §2.2 — FR1.*`
  },
  {
    id: 'f-fr-02-range',
    category: 'Requirements',
    chip: 'FR2 — Range (2.5 x 2 km, >=20% SoC reserve)',
    question: 'What range envelope and battery reserve does FR2 require?',
    answer: `**FR2 — Range** defines the operating envelope across the BAPCO refinery.

- **Threshold:** Complete any point-to-point mission within a **2.5 km x 2 km operating envelope** with **>=20% SoC reserve** on landing.
- **Criticality:** 9
- **Compliance:** 3
- **Why the low compliance:** Maintaining a 20% State-of-Charge reserve across the full envelope under wind/payload load is hard for COTS drones; the criticality of 9 reflects that range failure means a stranded/lost aircraft over hazardous infrastructure.

*Source: §2.2 — FR2.*`
  },
  {
    id: 'f-fr-04-manual-override',
    category: 'Requirements',
    chip: 'FR4 — Manual override (<=2 s latency)',
    question: 'How does FR4 define manual override, and why is the latency budget 2 s?',
    answer: `**FR4 — Manual Override** ensures the operator can always reclaim authority.

- **Threshold:** Operator can assume control / command land within **<=2 s command latency**.
- **Criticality:** 9
- **Compliance:** 5
- **Why 2 s:** It is a human-factors bound — long enough to be achievable over a refinery RF link with hand-off, short enough that an operator can intercept an emerging hazard (e.g. drift toward a stack) before it propagates. The 9/5 split shows it is safety-critical but only moderately easy to verify end-to-end.

*Source: §2.2 — FR4.*`
  },
  {
    id: 'f-fr-08-wind',
    category: 'Requirements',
    chip: 'FR8 — Wind resistance (10 m/s)',
    question: 'What wind threshold does FR8 assume, and how is it expressed?',
    answer: `**FR8 — Wind Resistance** governs go/no-go decisions at launch.

- **Threshold:** Launch permitted up to a defined wind threshold (**assumption: 10 m/s**) with stable flight; the threshold must be documented.
- **Criticality:** 6
- **Compliance:** 5
- **Notes:** 10 m/s (~36 km/h, ~Beaufort 5) is a typical envelope for sub-25 kg multirotors and aligns with refinery met-mast data. The requirement is *parametric*: the actual figure must be recorded so weather-API checks (FR19) can gate launches against it.

*Source: §2.2 — FR8.*`
  },
  {
    id: 'f-fr-11-charging',
    category: 'Requirements',
    chip: 'FR11 — Charging (80% in 45 min OR swap <=5 min)',
    question: 'What turnaround options does FR11 allow for recharging or swapping batteries?',
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
    id: 'f-fr-12-payload-integrity',
    category: 'Requirements',
    chip: 'FR12 — Payload integrity (<=15 deg C change)',
    question: 'What does FR12 require for payload integrity in transit?',
    answer: `**FR12 — Payload Integrity** protects refinery samples from in-flight degradation.

- **Threshold:** Payload must be **intact upon arrival** with **less than 15 deg C of temperature change** from dispatch to delivery.
- **Criticality:** 9
- **Compliance:** 5
- **Why it matters at BAPCO:** Hydrocarbon samples for lab analysis (octane, sulphur, vapour pressure) can shift composition with thermal load; bounding the delta to <15 deg C keeps results within lab acceptance bands. Insulated/sealed sample boxes plus short flight times are the typical means of compliance.

*Source: §2.2 — FR12.*`
  },
  {
    id: 'f-fr-13-collision',
    category: 'Requirements',
    chip: 'FR13 — Collision prevention',
    question: 'How is collision prevention specified and verified under FR13?',
    answer: `**FR13 — Collision Prevention** is one of only two FRs scored 9 on *both* criticality and compliance.

- **Threshold:** Function **demonstrable via simulation or workflow prototype**; acceptance evidence captured.
- **Criticality:** 9
- **Compliance:** 9
- **Reading the scores:** A 9/9 means the team considers this both safety-critical and highly verifiable — modern obstacle-avoidance stacks (stereo, LiDAR, time-of-flight) plus simulation harnesses can produce the acceptance evidence the FR demands. Logged simulation runs and prototype walk-throughs are the expected artefacts.

*Source: §2.2 — FR13.*`
  },
  {
    id: 'f-fr-17-geofencing',
    category: 'Requirements',
    chip: 'FR17 — Geofencing (criticality 9 vs conformance 5)',
    question: 'Why is FR17 geofencing rated criticality 9 but conformance only 5?',
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
    id: 'f-fr-22-estop',
    category: 'Requirements',
    chip: 'FR22 — Emergency stop',
    question: 'What does FR22 require for the emergency-stop command?',
    answer: `**FR22 — Emergency Stop Command** is the operator's last-resort control.

- **Threshold:** Operator can send an **E-stop signal**, triggering an **immediate controlled descent and land**.
- **Criticality:** 9
- **Compliance:** 5
- **Design note:** "Controlled descent" — not motor cut-off — is deliberate: at refinery altitudes, killing motors over process equipment would create a falling-object hazard worse than the original fault. The E-stop therefore commands a deterministic descent profile to the nearest safe area, consistent with the geofence (FR17) and landing-zone safety check (FR23).

*Source: §2.2 — FR22.*`
  },

{
    id: 'f-fr-25-preflight',
    category: 'Requirements',
    chip: 'FR25 — Automated pre-flight check',
    question: 'What does FR25 require for automated pre-flight checks before drone launch?',
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
    id: 'f-fr-27-status-broadcast',
    category: 'Requirements',
    chip: 'FR27 — Status broadcast every <=5 s',
    question: 'How frequently must drones broadcast position and status under FR27?',
    answer: `**FR27 — Status update broadcast** requires each drone to transmit its **position and status every \`≤5 s\`**.

**Key points:**
- Cadence threshold: **\`≤5 s\`** between updates.
- Any **interruption** in the broadcast stream is **logged** for later audit.
- This feeds the live tracking GUI (FR28) and the immutable mission log (FR32).

The tight cadence ensures operators can react quickly to a stalled or off-course drone over the BAPCO refinery footprint.

*Source: §2.2 — FR27.*`
  },
  {
    id: 'f-fr-28-tracking-telemetry',
    category: 'Requirements',
    chip: 'FR28 — Real-time tracking & telemetry',
    question: 'What information does the FR28 real-time tracking GUI surface, and at what refresh rate?',
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
    id: 'f-fr-30-landing-precision',
    category: 'Requirements',
    chip: 'FR30 — Landing precision <=1.0 m',
    question: 'What landing precision target does FR30 set for the autonomous drones?',
    answer: `**FR30 — Landing precision** sets a **conceptual target** for how accurately the drone lands on its marked pad.

**Threshold:**
- The drone shall land on the marked pad **within \`≤1.0 m\`** under nominal conditions.

**Caveats:**
- Quoted as a **conceptual target** — to be refined during prototyping.
- Applies under **nominal** (non-degraded) weather/wind conditions; weather gating is handled separately by FR36.

*Source: §2.2 — FR30.*`
  },
  {
    id: 'f-fr-32-audit-log',
    category: 'Requirements',
    chip: 'FR32 — Immutable mission audit log',
    question: 'What does FR32 require the mission audit log to contain, and why must it be immutable?',
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
    id: 'f-fr-35-obstacle-avoidance',
    category: 'Requirements',
    chip: 'FR35 — Obstacle avoidance (baseline)',
    question: 'How does FR35 scope obstacle avoidance for the BAPCO drone fleet?',
    answer: `**FR35 — Obstacle avoidance (baseline)** distinguishes between two tiers of avoidance:

**In scope (baseline):**
- The system maintains separation from **known obstacles** using **mapped keep-out volumes** (e.g., flare stacks, process columns).

**Out of scope for the baseline build (future scope):**
- **Dynamic avoidance** of unmapped or moving obstacles is **documented as future scope** rather than delivered initially.

This staged approach keeps the first deployment tractable while leaving a clear upgrade path for sense-and-avoid capability.

*Source: §2.2 — FR35.*`
  },
  {
    id: 'f-fr-37-secure-latch',
    category: 'Requirements',
    chip: 'FR37 — Authenticated payload latch',
    question: 'How does FR37 secure the payload during flight and at the delivery point?',
    answer: `**FR37 — Secure payload latch mechanism** governs the physical custody of the sample.

**In-flight behaviour:**
- The payload latch **remains locked** for the entire flight.

**At the delivery point:**
- Unlocking requires an **authenticated command** — the latch will not open from a tamper, a drop, or a spoofed signal.

This protects sample integrity (chain of custody for lab samples) and prevents unauthorised retrieval anywhere along the route inside the refinery.

*Source: §2.2 — FR37.*`
  },
  {
    id: 'f-fr-38-fleet-scalability',
    category: 'Requirements',
    chip: 'FR38 — Fleet scalability',
    question: 'How does FR38 ensure the architecture can scale to additional drones?',
    answer: `**FR38 — Fleet scalability (X no. drones)** requires the architecture to grow without redesign.

**Architectural guarantees:**
- New drones can be added with **separate IDs**.
- Each drone supports **independent mission assignment**.

**Implication:** mission queues, telemetry channels (FR27), and audit logs (FR32) must all key on drone ID rather than assume a fixed unit count, so BAPCO can grow the fleet over time as demand warrants.

*Source: §2.2 — FR38.*`
  },
  {
    id: 'f-fr-40-continuous-use',
    category: 'Requirements',
    chip: 'FR40 — Continuous-use operating model',
    question: 'What operating model does FR40 define for day-to-day drone operations?',
    answer: `**FR40 — Continuous-use operating model** defines how the service runs in steady state.

**Operating concept includes:**
- **Daily operation** (continuous service rather than ad-hoc sorties).
- **Scheduled maintenance windows** for planned downtime.
- A defined **fault escalation path** so issues route to the right engineer/team without delay.

This requirement is the bridge between the technical FRs and the contractual support obligations (e.g., 24/7 support in the CR table).

*Source: §2.2 — FR40.*`
  },

{
    id: 'g-nfr-overview',
    category: 'Requirements',
    chip: 'NFRs: what they cover at a high level',
    question: 'What are the Non-Functional Requirements (NFRs) and what do they cover?',
    answer: `**Non-Functional Requirements (NFRs)** describe *how* the autonomous drone-delivery system must behave, rather than *what* features it provides. In our specification (Table 2) the NFRs span the cross-cutting qualities that BAPCO needs from any compliant solution:\n\n- **Regulatory & legal**: drone registration with the Bahrain CAA (NFR1), legal mass limits (NFR6), ATEX/refinery safety compliance (NFR9).\n- **Reliability & service life**: ≥5-year service life or ≥6,500 cycles (NFR2), fail-safe autonomous landing (NFR3), environmental tolerance for 10–50 °C and <90 % humidity (NFR10).\n- **Operability & supportability**: GUI for mission control and monitoring (NFR8), abundant spare parts with ≤4-week lead time (NFR4), 6-month on-site spares stock (NFR11), minimal disruption to refinery operations (NFR5).\n- **Security**: cybersecurity threat model with auth, encryption and logging (NFR7).\n\nEach NFR carries a **Criticality** and **Complexity** score so suppliers can be assessed objectively, and each row links back to the Risk Analysis (§8) where relevant.\n\n*Source: §2.2 / §12.2 — NFR1–NFR11.*`
  },
  {
    id: 'g-nfr3-failsafe-landing',
    category: 'Requirements',
    chip: 'NFR3 — Fail-safe autonomous landing',
    question: 'Walk me through NFR3 — the fail-safe landing requirement.',
    answer: `**NFR3 — Fail-safe landing** is one of the highest-criticality NFRs (criticality 9, complexity 6) because it directly protects refinery personnel and assets if a drone loses link, power or controllability inside BAPCO.\n\n- **What it mandates**: the drone *must* land safely and autonomously in any of the emergency situations enumerated in the **Risk Analysis (§8)** — e.g. lost C2 link, low battery, GPS denial, motor failure, geofence breach.\n- **Why it matters here**: BAPCO is an operating refinery; an uncontrolled descent over process units could cause ATEX ignition, pipe damage or injury, so a deterministic safe-landing behaviour is non-negotiable.\n- **How a supplier evidences it**: pre-defined emergency-landing zones, redundant IMU/GPS, automated return-to-home with battery-aware path planning, and demonstrated flight-test logs of triggered failsafes.\n- **Couples to**: NFR9 (ATEX safe standoff) and NFR7 (cyber events that may also force a landing).\n\n*Source: §2.2 / §12.2 — NFR3.*`
  },
  {
    id: 'g-nfr7-cybersecurity',
    category: 'Requirements',
    chip: 'NFR7 — Cybersecurity risks mitigated',
    question: 'Walk me through NFR7 — the cybersecurity NFR.',
    answer: `**NFR7 — Cybersecurity risks mitigated** addresses the threat surface of an autonomous, network-connected drone fleet operating inside an OT environment.\n\n- **Mandate**: the supplier must produce a **threat model** for the drone, ground station and data pipeline, and implement at minimum the following controls:\n  1. **Authentication** — strong identity for operators, drones and back-end services.\n  2. **Encryption** — in transit (C2, telemetry, video) and at rest (mission logs, imagery).\n  3. **Logging** — tamper-evident audit trails to support incident response.\n- **Criticality / complexity**: 9 / 5 — high impact, moderate to deliver because the building blocks (TLS, mTLS, signed firmware, SIEM ingestion) are well understood.\n- **Reads across to**: **IR2** (integration with BAPCO IT), **IR5** (Bahrain data-protection law), and **IR6** (ISO 27001:2022 physical security of drone bases) — together they form the security envelope.\n\n*Source: §2.2 / §12.2 — NFR7.*`
  },
  {
    id: 'g-ir1-operator-training',
    category: 'Requirements',
    chip: 'IR1 — Operator training programme',
    question: 'What does IR1 require for the operator training programme?',
    answer: `**IR1 — Operator training programme and competency sign-off** (criticality 6, complexity 6) ensures that BAPCO personnel can safely run the drone service from day one.\n\n- **Scope of training**:\n  - Pre-flight checks, mission planning in the GUI (ties to NFR8) and post-flight logging.\n  - Emergency procedures including manual override and the NFR3 fail-safe landing flow.\n  - ATEX/refinery-specific operating constraints (NFR9) and exclusion-zone handling.\n  - Cyber-hygiene for ground-station accounts (links to NFR7).\n- **Competency sign-off**: each operator is formally assessed and signed off before being allowed solo operations; records are retained for audit.\n- **Commercial dimension** in the RFP: supplier specifies *who delivers* training (Bapco, Supplier, or 3rd party), **cost**, and whether a **demo is needed (Yes / No / Partial)**.\n\n*Source: §9.2, Table 25 — IR1.*`
  },
  {
    id: 'g-ir2-it-integration',
    category: 'Requirements',
    chip: 'IR2 — Integration with existing BAPCO IT',
    question: 'How does IR2 govern integration with existing BAPCO IT infrastructure?',
    answer: `**IR2 — Integration with existing Bapco IT infrastructure** (criticality 6, complexity 7 — the *highest complexity* in the IR table) recognises that the drone system cannot be a silo.\n\n- **What needs integrating**:\n  - **Identity & access**: SSO / Active Directory for operator log-in to the ground station.\n  - **Maintenance & asset systems**: feeds from inspection flights into BAPCO's CMMS / work-order system.\n  - **Data lakes / historians**: telemetry and anomaly detections (IR4) consumed alongside existing process data.\n  - **Network segmentation**: drone C2 sits in an appropriately segmented zone so it does not bridge IT and OT improperly.\n- **Why complexity is 7**: each integration crosses an organisational boundary, requires BAPCO IT change-management approval, and must respect existing security baselines.\n- **Supplier responsibility split** is captured in the RFP "Ownership" column — Bapco, Supplier, or 3rd Party.\n\n*Source: §9.2, Table 25 — IR2.*`
  },
  {
    id: 'g-ir3-edge-computing',
    category: 'Requirements',
    chip: 'IR3 — On-board edge computing',
    question: 'What does IR3 specify about on-board edge computing for AI-driven autonomy?',
    answer: `**IR3 — On-board edge computing for AI-driven autonomy** (criticality 6, complexity 5) requires the drone to carry sufficient compute to make safety-critical decisions locally rather than relying on a round-trip to a cloud or ground server.\n\n- **Capabilities to be hosted at the edge**:\n  - Real-time perception (obstacle and personnel detection).\n  - Path-planning and geofence enforcement.\n  - First-pass anomaly detection feeding **IR4** (with external verification downstream).\n  - Failsafe state machine for **NFR3** landings.\n- **Why edge and not cloud**:\n  - **Latency**: refinery flight envelopes leave no time for a cloud round-trip.\n  - **Resilience**: drone must remain safe if RF link degrades.\n  - **Bandwidth**: only summarised events/imagery are uplinked, easing the IR2 integration load.\n- **Supplier disclosure** in the RFP: target SoC, TOPS budget, model-update mechanism and signed-firmware story (links to NFR7).\n\n*Source: §9.2, Table 25 — IR3.*`
  },
  {
    id: 'g-ir5-bahrain-data-law',
    category: 'Requirements',
    chip: 'IR5 — Bahrain data protection legislation',
    question: 'How does IR5 address Bahrain data protection legislation?',
    answer: `**IR5 — Data storage in accordance with Bahrain data protection legislation** (criticality 6, complexity 5) ensures that any personal data captured by drones — for example faces in inspection imagery or operator account data — is handled lawfully under **Bahrain's Personal Data Protection Law (PDPL, Law No. 30 of 2018)**.\n\n- **Practical controls expected from the supplier**:\n  - **Data residency** — primary storage of personal data within Bahrain unless a lawful transfer mechanism exists.\n  - **Lawful basis & minimisation** — only capture/retain data needed for inspection and safety.\n  - **Subject rights workflow** — access, rectification and deletion requests can be honoured.\n  - **Retention schedule** with automated purge.\n  - **Breach-notification process** aligned with PDPL timelines.\n- **Couples to**: NFR7 (encryption, logging) and IR6 (physical security of the bases that host the data).\n\n*Source: §9.2, Table 25 — IR5.*`
  },
  {
    id: 'g-ir6-iso27001-physical',
    category: 'Requirements',
    chip: 'IR6 — Physical security to ISO 27001:2022',
    question: 'What does IR6 require for physical security of the drone bases?',
    answer: `**IR6 — Physical security of drone bases to ISO 27001:2022** (criticality 9, complexity 5 — the *highest-criticality* IR) extends the cyber controls of NFR7 into the physical world.\n\n- **Reference standard**: **ISO/IEC 27001:2022**, in particular the *Annex A controls in the "Physical" theme* (A.7.1–A.7.14), covering:\n  - Secure perimeters and physical entry controls for drone hangars / charging pads.\n  - Protection against environmental threats (heat, dust, ATEX zone considerations).\n  - Equipment siting, secure disposal, and clear-desk/clear-screen for ground stations.\n  - Cabling and supporting-utilities security.\n- **Operational expectations**:\n  - Tamper-evident enclosures for drones at rest.\n  - Logged badge access and CCTV coverage of the base.\n  - Documented procedures for maintenance visitors, aligned with IR7 maintenance windows.\n- **Why criticality 9**: a compromised base could allow firmware tampering or theft of an asset that is then flown over live process units.\n\n*Source: §9.2, Table 25 — IR6.*`
  },
  {
    id: 'g-ir7-maintenance-interval',
    category: 'Requirements',
    chip: 'IR7 — Maintenance every 200 hr / 3 months',
    question: 'What does IR7 specify about routine maintenance intervals?',
    answer: `**IR7 — Routine maintenance intervals ≥200 flight hours or 3 months** (criticality 6, complexity 5) sets a *minimum* preventive-maintenance cadence so that drones remain airworthy throughout the NFR2 service life.\n\n- **The rule** — whichever comes *first*:\n  - **≥200 flight hours** of cumulative airtime, **or**\n  - **3 calendar months** since the last service.\n- **Typical scope of a service**: motor/ESC inspection, propeller replacement, battery health check and recalibration, IMU/GPS calibration, firmware and security-patch update (ties to NFR7), structural inspection for ATEX-relevant damage (NFR9).\n- **Why two triggers**: low-utilisation drones still degrade calendar-wise (battery chemistry, seal aging in Bahrain humidity per NFR10), while heavily flown drones reach wear thresholds before 3 months elapse.\n- **Scheduling**: maintenance windows should be planned against **IR8** so that downtime aligns with refinery operating schedules and spares draw on the NFR4 / NFR11 stock.\n\n*Source: §9.2, Table 25 — IR7.*`
  },

{
    id: 'h-bcaa-role',
    category: 'Regulatory',
    chip: 'BCAA role in approvals',
    question: 'What is BCAA and what is its role here?',
    answer: `**BCAA** is the **Bahrain Civil Aviation Affairs**, the national authority that regulates unmanned aerial systems (UAS) and grants flight approvals — including BVLOS (Beyond Visual Line of Sight) operations.\n\nIts role in this project:\n\n- **Approval gatekeeper:** All drone deliveries at the BAPCO refinery require BCAA authorisation before flight.\n- **Risk driver:** Civil aviation approval delays are logged in Risk Category E (Risk #1) with a probability of 3 and impact of 5 (RPN = 15), classified as a *Regulatory* risk that would cause **deployment delay**.\n- **Mitigation:** The team commits to **early engagement with BCAA** to secure airspace approvals before deployment, and Clause 14 obliges the Supplier to comply with Bahrain CAA rules for unmanned aerial systems and telecoms constraints.\n\n*Source: §8.5 Risk Category E (Table 21, Risk #1) and §10 Clause 14.*`
  },
  {
    id: 'h-bvlos-illegal',
    category: 'Regulatory',
    chip: 'BVLOS legality in Bahrain',
    question: 'Why is BVLOS flight illegal in Bahrain without approval?',
    answer: `BVLOS (Beyond Visual Line of Sight) flights are not permitted by default in Bahrain because the **BCAA (Bahrain Civil Aviation Affairs)** must explicitly authorise unmanned operations that go beyond standard visual range.\n\nKey points from the report:\n\n- **Clause 14 (Regulatory and site compliance)** requires the Supplier to comply with **Bahrain CAA rules for unmanned aerial systems** and applicable telecoms constraints — flights outside those rules are non-compliant.\n- **Risk Category E (Risk #1)** identifies *civil aviation approval delays* as a high-RPN regulatory risk (RPN = 15) because operations cannot legally start without sign-off.\n- **Mitigation:** Early engagement with BCAA is required to secure BVLOS approval, plus telecoms-spectrum clearance for the C2 link.\n\nWithout BCAA approval, any BVLOS sortie at BAPCO would breach Bahraini aviation law and trigger an immediate safety shutdown.\n\n*Source: §8.5 Risk Category E (Risk #1) and §10 Clause 14.*`
  },
  {
    id: 'h-atex-certification',
    category: 'Regulatory',
    chip: 'ATEX certification in hazardous zones',
    question: 'What is ATEX certification and why is it needed?',
    answer: `**ATEX** is the European certification scheme for equipment used in **explosive atmospheres** (named after the French *ATmosphères EXplosibles* directives). It demonstrates that a device cannot ignite flammable vapours, gases, or dust.\n\nWhy it matters at BAPCO:\n\n- The refinery contains **hazardous zones** with hydrocarbon vapours; any electrical or electronic equipment flown into those zones must be ignition-safe.\n- **Clause 14** requires the Supplier to provide **certified compliance evidence (e.g. ATEX certification)** wherever hazardous-area constraints apply, or otherwise enforce a documented **safe-standoff geofence**.\n- **Risk Category E (Risk #2)** lists *ATEX certification delay* with P=3, I=5, **RPN = 15**, classified as *Compliance*. The operational impact is **inability to operate in hazardous zones**.\n- **Mitigation:** Pre-certification testing is performed before deployment so that ATEX evidence is in hand by SAT.\n\n*Source: §8.5 Risk Category E (Risk #2) and §10 Clause 14.*`
  },
  {
    id: 'h-hse-non-compliance',
    category: 'Regulatory',
    chip: 'HSE non-compliance risk',
    question: 'What is HSE non-compliance risk?',
    answer: `**HSE** stands for **Health, Safety, and Environment** — the operational rule set governing how work is conducted at the BAPCO refinery.\n\nThe report flags HSE non-compliance as Risk #3 in Risk Category E:\n\n- **Probability:** 2\n- **Impact:** 5\n- **RPN:** 10\n- **Type:** Compliance\n- **Operational impact:** **Safety shutdown** — refinery operators can halt drone activities if procedures are not followed.\n- **Mitigation:** Routine **safety audits** of drone operating procedures to ensure ongoing alignment with refinery HSE standards.\n\nIn practice this means drone procedures (pre-flight checks, hazardous-zone handling, emergency landings) must mirror BAPCO's existing HSE documentation, or the project loses its licence to operate on-site.\n\n*Source: §8.5 Risk Category E (Risk #3).*`
  },
  {
    id: 'h-ptw-alignment',
    category: 'Regulatory',
    chip: 'Permit-To-Work alignment',
    question: 'What is the Permit-To-Work (PTW) process and how does the project align?',
    answer: `A **Permit-To-Work (PTW)** is the formal authorisation system used at refineries to control hazardous activities — each task requires a written permit listing controls, isolations, and time windows before work can start.\n\nProject alignment:\n\n- **Risk Category E (Risk #6)** identifies *misalignment with permit-to-work procedures* with P=3, I=4, **RPN = 12**, type *Compliance*.\n- **Operational impact:** Operational delays and flight restrictions if drone missions clash with active PTWs (e.g. hot work, confined-space entry).\n- **Mitigation:** **Align drone operations with the existing PTW process** — every mission is checked against the active permit register so that drones do not enter areas with conflicting permits, and drone activity itself is captured under the PTW system.\n\nThis ensures BAPCO's safety controllers retain a single source of truth for who is doing what, where, and when across the site.\n\n*Source: §8.5 Risk Category E (Risk #6).*`
  },
  {
    id: 'h-data-residency-bahrain',
    category: 'Regulatory',
    chip: 'Bahrain data residency',
    question: 'Why must operational data stay in Bahrain (Clause 16)?',
    answer: `Clause 16 of the Project Contract — *Data ownership, residency, and portability* — restricts where operational data may be stored or transferred.\n\nKey requirements:\n\n- **Bapco ownership:** All operational data (**flight logs, telemetry, maintenance records, mission history**) is Bapco property.\n- **Residency:** Data **shall not be transferred outside Bahrain without written authorisation**, in line with Bahraini data-protection legislation and refinery confidentiality.\n- **Portability:** Supplier-held data must be exportable in **non-proprietary formats within 15 business days** upon request or termination, at no extra cost.\n\nKeeping data inside Bahrain protects against foreign legal exposure, satisfies the Personal Data Protection Law, and maintains BAPCO's control over commercially sensitive refinery information.\n\n*Source: §10 Clause 16.*`
  },
  {
    id: 'h-data-protection-ir5',
    category: 'Regulatory',
    chip: 'Bahrain data protection (IR5)',
    question: 'How does the project comply with Bahrain data protection law (IR5)?',
    answer: `Information Requirement **IR5** mandates *"Data storage in accordance with Bahrain data protection legislation"* (criticality 6, complexity 5).\n\nCompliance approach:\n\n- **In-country hosting:** Operational data is stored on infrastructure physically located in Bahrain, satisfying the residency rule of Clause 16.\n- **Risk #4 (Data retention non-compliance)** is mitigated by **secure local hosting** (RPN = 8, type Compliance), preventing regulatory penalties.\n- **Access controls:** Aligned with the ISO 27001 controls under IR6/Clause 15 so that personal and operational data is protected end-to-end.\n- **Cross-border transfers:** Forbidden without **written authorisation**, mirroring the consent and adequacy requirements of Bahrain's Personal Data Protection Law.\n\nCombined, IR5 + Clause 16 give BAPCO a defensible, auditable trail showing data protection law has been observed.\n\n*Source: §10 Project Requirements IR5 and Clause 16; §8.5 Risk Category E (Risk #4).*`
  },
  {
    id: 'h-iso-27001-controls',
    category: 'Regulatory',
    chip: 'ISO 27001 controls (IR6, Clause 15)',
    question: 'What ISO 27001 controls apply (Clause 15, IR6)?',
    answer: `The project anchors its cybersecurity posture in **ISO 27001:2022** through two artefacts:\n\n- **IR6 — Physical security of drone bases to ISO 27001:2022** (criticality 9, complexity 5): drone hangars, charging pads, and ground-control rooms must apply ISO 27001 physical-security controls (access control, surveillance, environmental protection, asset handling).\n- **Clause 15 — Cybersecurity and secure-by-design controls:** the Supplier's implementation must **align with ISO 27001**, covering logical access, encryption, secure development, and incident response.\n- **Breach reporting:** Suspected or confirmed breaches must be reported within **24 hours**, with **containment action initiated upon detection**.\n\nTogether these implement Annex A controls across physical (A.7), access (A.5/A.8), operations (A.8), and incident-management (A.5.24-30) domains.\n\n*Source: §10 Project Requirement IR6 and Clause 15.*`
  },
  {
    id: 'h-insurance-gaps',
    category: 'Regulatory',
    chip: 'Insurance coverage gaps',
    question: 'How are insurance coverage gaps handled?',
    answer: `**Risk Category E (Risk #5)** identifies *insurance coverage gaps* as a Legal risk:\n\n- **Probability:** 2\n- **Impact:** 4\n- **RPN:** 8\n- **Type:** Legal\n- **Operational impact:** **Financial exposure** — uncovered third-party damage, cargo loss, or hull loss would fall on the Supplier or BAPCO directly.\n\nMitigation strategy: secure **contract protection clauses** that bind the Supplier to maintain adequate aviation, public-liability, cargo, and cyber-incident insurance for the full lifecycle, with named-insured rights for BAPCO and certificates renewed before expiry.\n\nThis supplements the indemnity language (e.g. Clause 18 IP indemnity) so BAPCO is not left bearing financial risk that should sit with the Supplier or its insurer.\n\n*Source: §8.5 Risk Category E (Risk #5).*`
  },
  {
    id: 'h-data-retention-compliance',
    category: 'Regulatory',
    chip: 'Data retention compliance',
    question: 'How does the project handle data retention compliance?',
    answer: `Data retention is treated as a Compliance risk and is controlled through layered safeguards:\n\n- **Risk #4 — Data retention non-compliance** (P=2, I=4, **RPN = 8**, type Compliance). Operational impact: **regulatory penalties**. Mitigation: **secure local hosting** keeps data inside Bahrain for the legally required retention window.\n- **Clause 16 (Data ownership, residency, portability):** flight logs, telemetry, maintenance records, and mission history are owned by BAPCO and exportable in non-proprietary formats within **15 business days** of request or termination — guaranteeing the client can satisfy any audit or retention demand.\n- **IR5:** Storage practices follow Bahrain data-protection legislation, including retention periods aligned with the Personal Data Protection Law.\n- **IR6 / Clause 15:** ISO 27001 controls cover secure deletion, backup integrity, and access logging across the retention lifecycle.\n\n*Source: §8.5 Risk Category E (Risk #4); §10 Clause 16, IR5, IR6, Clause 15.*`
  },

{
    id: 'risk-strategic-misalignment-bapco',
    category: 'Risk',
    chip: 'Strategic risk: misalignment with BAPCO priorities',
    question: 'What is the risk of misalignment with BAPCO operational priorities and KPIs?',
    answer: `Misalignment with BAPCO operational priorities and KPIs is a strategic risk that can lead to misaligned system functionality and underutilisation of the drone fleet. It is mitigated through consistent reviews, KPI alignment meetings, and a signed CONOPS.\n\n**P=2, I=5, RPN=10**\n\n*Source: §8.1 — Risk #A1.*`
  },
  {
    id: 'risk-strategic-scope-expansion',
    category: 'Risk',
    chip: 'Strategic risk: scope expansion during pilot/rollout',
    question: 'How does scope expansion during the pilot and rollout phase impact the project?',
    answer: `Expansion of project scope during pilot and rollout is a strategic risk that causes delays in deployment, increased costs, and resource overload. It is mitigated through a formal change control process requiring approval.\n\n**P=3, I=4, RPN=12**\n\n*Source: §8.1 — Risk #A2.*`
  },
  {
    id: 'risk-strategic-roi-failure',
    category: 'Risk',
    chip: 'Strategic risk: failure to demonstrate ROI',
    question: 'What happens if the project fails to demonstrate ROI after deployment?',
    answer: `Failure to demonstrate ROI after deployment is a strategic risk that can reduce executive support and risk project discontinuation. Mitigation requires defining clear performance KPIs before launch and comparing results post-implementation.\n\n**P=3, I=4, RPN=12**\n\n*Source: §8.1 — Risk #A3.*`
  },
  {
    id: 'risk-technical-comms-link-loss',
    category: 'Risk',
    chip: 'Technical risk: communication link loss in flight',
    question: 'What is the impact of communication link loss during a drone mission?',
    answer: `Communication link loss during mission is a technical risk causing interrupted missions and delayed deliveries. The mitigation is dual communication channels to ensure resilience.\n\n**P=3, I=4, RPN=12**\n\n*Source: §8.2 — Risk #B4.*`
  },
  {
    id: 'risk-technical-software-regression',
    category: 'Risk',
    chip: 'Technical risk: software update regression',
    question: 'How does a software update introducing regression affect the fleet?',
    answer: `A software update that introduces regression is a technical risk causing system instability across the fleet. Mitigation includes staged rollout and rollback capability to recover quickly from faulty updates.\n\n**P=3, I=4, RPN=12**\n\n*Source: §8.2 — Risk #B6.*`
  },
  {
    id: 'risk-technical-supplier-delays',
    category: 'Risk',
    chip: 'Technical risk: supplier delays for critical components',
    question: 'What is the risk of supplier delays for critical drone components?',
    answer: `Supplier delays for critical components are a technical risk that result in deployment delays. Mitigation relies on multi-sourcing and maintaining buffer stock of essential parts.\n\n**P=3, I=3, RPN=9**\n\n*Source: §8.2 — Risk #B8.*`
  },
  {
    id: 'risk-ai-model-drift',
    category: 'Risk',
    chip: 'AI risk: model drift reducing detection accuracy',
    question: 'How does model drift affect the AI obstacle detection system?',
    answer: `Model drift reducing detection accuracy is a technical AI risk that lowers obstacle detection reliability over time. It is mitigated through scheduled retraining and validation of the perception models.\n\n**P=3, I=4, RPN=12**\n\n*Source: §8.3 — Risk #C1.*`
  },
  {
    id: 'risk-ai-false-positives',
    category: 'Risk',
    chip: 'AI risk: excess false positives causing aborts',
    question: 'What is the impact of excess false positives in obstacle detection?',
    answer: `Excess false positives causing aborts is a technical AI risk leading to unnecessary mission interruptions. The mitigation strategy is detection-threshold tuning and rigorous testing.\n\n**P=3, I=3, RPN=9**\n\n*Source: §8.3 — Risk #C3.*`
  },
  {
    id: 'risk-ai-cyberattack-control',
    category: 'Risk',
    chip: 'Security risk: cyberattack on drone control',
    question: 'What is the risk of a cyberattack on the drone control system?',
    answer: `A cyberattack on the drone control system is a security risk causing operational disruption to the autonomous fleet. Mitigation is implemented through encrypted communications between drones and ground control.\n\n**P=2, I=5, RPN=10**\n\n*Source: §8.3 — Risk #C5.*`
  },
  {
    id: 'risk-ai-low-explainability',
    category: 'Risk',
    chip: 'AI risk: low explainability reduces operator trust',
    question: 'How does low AI explainability affect operator trust?',
    answer: `Low explainability of AI decisions is an organisational risk that reduces operator trust in the autonomous system, hindering adoption and oversight. Addressing it requires building interpretable model outputs and transparent decision logs.\n\n**P=3, I=3, RPN=9**\n\n*Source: §8.3 — Risk #C8.*`
  },

{
    id: 'i-d1-collision-refinery-infrastructure',
    category: 'Risk',
    chip: 'D1: Collision with refinery infrastructure',
    question: 'What is the risk of drone collision with refinery infrastructure (D1)?',
    answer: `Risk D1 covers drones colliding with refinery infrastructure (towers, pipework, flares), causing damage to assets and operational disruption.\n\n**P=2, I=5, RPN=10** (Safety).\n\nMitigation: *Geofencing and avoidance systems* to keep drones clear of fixed assets.\n\n*Source: §8.4 — Risk #D1.*`
  },
  {
    id: 'i-d2-battery-fire',
    category: 'Risk',
    chip: 'D2: Battery fire during operation or charging',
    question: 'How is the risk of a battery fire during operation or charging (D2) handled?',
    answer: `Risk D2 addresses Li-ion battery fires occurring in flight or while charging, which would trigger a safety incident and fleet shutdown.\n\n**P=2, I=5, RPN=10** (Safety).\n\nMitigation: *Certified charging and fire controls* to contain thermal events.\n\n*Source: §8.4 — Risk #D2.*`
  },
  {
    id: 'i-d3-emergency-landing-restricted-zone',
    category: 'Risk',
    chip: 'D3: Emergency landing in restricted zone',
    question: 'What if a drone has to make an emergency landing in a restricted zone (D3)?',
    answer: `Risk D3 covers an unplanned emergency landing inside a restricted refinery area, which would cause a temporary area shutdown.\n\n**P=2, I=5, RPN=10** (Safety).\n\nMitigation: *Pre-defined safe landing areas* designated across the BAPCO site.\n\n*Source: §8.4 — Risk #D3.*`
  },
  {
    id: 'i-d7-operator-error-mission-planning',
    category: 'Risk',
    chip: 'D7: Operator error in mission planning',
    question: 'How is operator error in mission planning (D7) mitigated?',
    answer: `Risk D7 covers human error during mission planning that leads to incorrect routing or mission abort.\n\n**P=3, I=4, RPN=12** (Human).\n\nMitigation: *SOPs and validation checks* applied before each flight.\n\n*Source: §8.4 — Risk #D7.*`
  },
  {
    id: 'i-e3-hse-non-compliance',
    category: 'Risk',
    chip: 'E3: HSE non-compliance in procedures',
    question: 'What is the risk of HSE non-compliance in procedures (E3)?',
    answer: `Risk E3 covers drone procedures failing to meet HSE standards, which would trigger a safety shutdown.\n\n**P=2, I=5, RPN=10** (Compli.).\n\nMitigation: *Safety audits* run on a regular cadence.\n\n*Source: §8.5 — Risk #E3.*`
  },
  {
    id: 'i-e5-insurance-coverage-gaps',
    category: 'Risk',
    chip: 'E5: Insurance coverage gaps',
    question: 'How are insurance coverage gaps (E5) addressed?',
    answer: `Risk E5 covers gaps in insurance coverage for drone operations, exposing Valthr and BAPCO to financial loss after an incident.\n\n**P=2, I=4, RPN=8** (Legal).\n\nMitigation: *Contract protection clauses* embedded in operator and vendor agreements.\n\n*Source: §8.5 — Risk #E5.*`
  },
  {
    id: 'i-e6-misalignment-ptw',
    category: 'Risk',
    chip: 'E6: Misalignment with permit-to-work procedures',
    question: 'What is the risk of misalignment with permit-to-work (PTW) procedures (E6)?',
    answer: `Risk E6 covers drone operations that do not align with BAPCO's permit-to-work process, causing operational delays and flight restrictions.\n\n**P=3, I=4, RPN=12** (Compli.).\n\nMitigation: *Align drone operations with existing PTW process*.\n\n*Source: §8.5 — Risk #E6.*`
  },
  {
    id: 'i-f1-capex-overrun',
    category: 'Risk',
    chip: 'F1: CAPEX overrun',
    question: 'How is the CAPEX overrun risk (F1) controlled?',
    answer: `Risk F1 covers capital expenditure exceeding plan, leading to budget pressure and scope reduction.\n\n**P=3, I=4, RPN=12** (Financial).\n\nMitigation: *Per-stage cost control* applied across the rollout.\n\n*Source: §8.6 — Risk #F1.*`
  },
  {
    id: 'i-f2-opex-underestimated',
    category: 'Risk',
    chip: 'F2: OPEX underestimated',
    question: 'What if operating expenditure is underestimated (F2)?',
    answer: `Risk F2 covers OPEX being set too low at planning, undermining the long-term sustainability of the drone programme.\n\n**P=3, I=4, RPN=12** (Financial).\n\nMitigation: *Lifecycle cost review* to recalibrate run-rate assumptions.\n\n*Source: §8.6 — Risk #F2.*`
  },
  {
    id: 'i-f3-vendor-lock-in',
    category: 'Risk',
    chip: 'F3: Vendor lock-in',
    question: 'How is vendor lock-in (F3) mitigated?',
    answer: `Risk F3 covers over-dependence on a single drone or platform vendor, reducing flexibility and raising future costs.\n\n**P=3, I=3, RPN=9** (Comm.).\n\nMitigation: *Open standards and exit clauses* written into supplier contracts.\n\n*Source: §8.6 — Risk #F3.*`
  },

{
    id: 'j-prince2',
    category: 'Glossary',
    chip: 'What is PRINCE2?',
    question: 'What is PRINCE2 / PRINCE2 7 and how does the report use it?',
    answer: `**Definition:** PRINCE2 (Projects IN Controlled Environments) is a structured, stage-gated project management methodology with defined roles, products, and tolerances; PRINCE2 7 is the 2023 refresh with improved Agile integration and digital reporting.\n\n**In this report:** Valthr evaluated PRINCE2 7 in Section 5 as a candidate methodology but rejected it as too document-heavy for a 6-month PoC, although its Risk Register concept was retained.\n\n*Source: §5 (Table 6, PRINCE2 Management methodology).*`
  },
  {
    id: 'j-agile-scrum',
    category: 'Glossary',
    chip: 'What is Agile-Scrum?',
    question: 'What is Agile-Scrum and how does the report use it?',
    answer: `**Definition:** Agile-Scrum is an iterative project management framework using short sprints (typically 2 weeks), a Scrum Master, product backlog, and daily stand-ups to deliver incremental value.\n\n**In this report:** Valthr selected Agile-Scrum as the project management methodology because it best fits the iterative, exploratory nature of the BAPCO drone PoC, with ~2-week sprints and a digital Kanban board.\n\n*Source: §5 (Table 7, Agile-Scrum management methodology).*`
  },
  {
    id: 'j-spiral-vmodel',
    category: 'Glossary',
    chip: 'What is the Spiral model?',
    question: 'What is the Spiral model (with V-model) and how does the report use it?',
    answer: `**Definition:** The Spiral model is a risk-driven software development lifecycle where each loop covers planning, risk analysis, engineering, and evaluation; the V-model pairs each development phase with a corresponding verification/validation activity.\n\n**In this report:** Valthr chose the Spiral model for its risk-driven emphasis on autonomous drone safety and integrated V-model principles into prototyping and simulation phases to maximise verification rigour.\n\n*Source: §5 (Table 10, Spiral Methodology).*`
  },
  {
    id: 'j-wbs',
    category: 'Glossary',
    chip: 'What is a WBS?',
    question: 'What is a Work Breakdown Structure (WBS) and how does the report use it?',
    answer: `**Definition:** A WBS is a deliverable-oriented hierarchical decomposition of project work into manageable packages, ensuring 100% scope coverage without duplication.\n\n**In this report:** Section 3 presents the PoC WBS with rationale and diagram, grouping co-located requirements such as geofencing under operational definition packages.\n\n*Source: §3 (WBS rationale and diagram).*`
  },
  {
    id: 'j-critical-path',
    category: 'Glossary',
    chip: 'What is the Critical Path?',
    question: 'What is Critical Path Analysis and how does the report use it?',
    answer: `**Definition:** The critical path is the longest sequence of dependent activities through a project schedule; tasks on it have zero float, so any delay slips the whole project.\n\n**In this report:** Section 4.1's Critical Path Diagram (Figure 7) identifies week 22 (integration and commissioning) as the key convergence point where setup and regulatory streams feed in, making it the highest-risk milestone.\n\n*Source: §4.1 Critical Path Analysis.*`
  },
  {
    id: 'j-moscow',
    category: 'Glossary',
    chip: 'What is MoSCoW?',
    question: 'What is MoSCoW prioritisation and how does the report use it?',
    answer: `**Definition:** MoSCoW classifies requirements into Must-have, Should-have, Could-have, and Won't-have categories to focus delivery on what is truly essential.\n\n**In this report:** Valthr applied MoSCoW to BAPCO's stated requirements (gathered via the email thread in Appendix 15) to triage scope for the PoC.\n\n*Source: §2 (Requirements engineering).*`
  },
  {
    id: 'j-abc',
    category: 'Glossary',
    chip: 'What is Activity-Based Costing?',
    question: 'What is Activity-Based Costing (ABC) and how does the report use it?',
    answer: `**Definition:** ABC assigns costs to activities and then to outputs based on actual resource consumption, often using time-driven operational rates for more accurate unit economics than traditional overhead allocation.\n\n**In this report:** Section 7 uses time-driven ABC to derive a total cost of £12.86 per delivery mission (£10.29 OPEX + CAPEX amortisation), with the full breakdown in Appendix 11.\n\n*Source: §7 and §11 (Full Activity-Based Costing).*`
  },
  {
    id: 'j-rpn',
    category: 'Glossary',
    chip: 'What is RPN?',
    question: 'What is Risk Priority Number (RPN) and how does the report use it?',
    answer: `**Definition:** RPN is a risk-ranking score computed by multiplying Possibility (P) by Criticality/Impact (I), used to prioritise mitigation and escalation.\n\n**In this report:** The risk register scores P and I from 1–5 and computes RPN = P x I across Organisational, Compliance, Regulatory and other categories to rank mitigations.\n\n*Source: §6 Risk scoring.*`
  },
  {
    id: 'j-apriltag',
    category: 'Glossary',
    chip: 'What are AprilTags?',
    question: 'What are AprilTag fiducial markers and how does the report use them?',
    answer: `**Definition:** AprilTags are 2D fiducial markers (similar to QR codes) detectable by a camera, providing precise relative pose estimation for robotics.\n\n**In this report:** A downward-facing camera detects AprilTags to achieve precise landing accuracy, which is why high-precision GPS RTK was deemed unnecessary (standard ~5m GPS suffices for cruise).\n\n*Source: §4 (Drone navigation/landing).*`
  },
  {
    id: 'j-floyd-warshall',
    category: 'Glossary',
    chip: 'What is Floyd-Warshall?',
    question: 'What is the Floyd-Warshall algorithm and how does the report use it?',
    answer: `**Definition:** Floyd-Warshall is a dynamic-programming algorithm that computes shortest paths between all pairs of nodes in a weighted graph in O(n^3) time.\n\n**In this report:** The fleet management system pre-computes all-pairs shortest paths via Floyd-Warshall at initialisation, enabling fast route assignment to drones during operation (Figure 9).\n\n*Source: §4 (Fleet management system).*`
  },

{
    id: 'k-lab-sample-end-to-end',
    category: 'Operations',
    chip: 'Lab sample delivery walkthrough',
    question: 'Walk through a typical lab-sample delivery end-to-end.',
    answer: `A technician submits a lab-sample delivery request from a rugged on-site tablet or office computer, viewing queued deliveries, ETAs, and drone status. The request is transmitted to the cloud or on-site edge server, which runs fleet optimisation and assigns a route to a specific drone. The route plan is uploaded to the drone via the Wi-Fi mesh network covering predefined air corridors between the nine stations. The drone flies autonomously using GPS (~5 m accuracy) along corridors generated by the Floyd-Warshall shortest-path computation, with onboard forward-facing cameras providing local obstacle avoidance. On approach, a downward-facing camera detects an AprilTag fiducial marker at the destination station to achieve centimetre-level landing precision. The sample is offloaded and the drone awaits its next assignment from the optimiser.\n\n*Source: §1.2, §5.1, §5.2.*`
  },
  {
    id: 'k-emergency-ppe-delivery',
    category: 'Operations',
    chip: 'Emergency PPE deployment',
    question: 'Describe an emergency PPE delivery scenario.',
    answer: `When safety equipment is urgently needed, the request is flagged high-priority and submitted via tablet or computer. The optimiser dispatches the nearest available (or soon-to-be-available) drone using the pre-computed shortest path between the nine stations, rather than inserting the task into an existing route. The drone navigates via the Wi-Fi-mesh-covered air corridors using GPS, with onboard obstacle avoidance handling short-range adjustments in real time. Intrinsically safe components allow operation in hazardous refinery zones, and AprilTag-based landing ensures precise drop-off near the incident location. This shortcut path minimises response time compared with manual transport across the 2.5 x 2 km site.\n\n*Source: §1.2, §5.1, §5.2.*`
  },
  {
    id: 'k-tools-spare-parts',
    category: 'Operations',
    chip: 'Tools and spare-parts transport',
    question: 'Describe a tools/spare-parts transport scenario.',
    answer: `An operator submits a tools or spare-parts request from a tablet or computer, which is routed to the cloud/edge optimiser. Because such tasks are typically lower priority, the optimiser evaluates all drones in the fleet of 20 and inserts the delivery into the route causing the smallest additional distance, improving overall fleet efficiency. The assigned drone collects the payload from its current micro-base station and flies along predefined air corridors between the relevant nodes (e.g. Fabrication Workshop to Central Refinery). GPS handles navigation, AprilTags handle landing, and onboard cameras manage local obstacle avoidance. The drone returns to the network and continues serving queued tasks.\n\n*Source: §1.2, §5.2.*`
  },
  {
    id: 'k-low-battery-mid-mission',
    category: 'Operations',
    chip: 'Low battery mid-mission handling',
    question: "What happens when a drone's battery is low mid-mission?",
    answer: `Battery status is one of the inputs the AI-driven dispatch platform uses when allocating tasks, so the optimiser tracks state of charge in real time. When charging is required, the fleet optimiser routes the drone to a wireless charging dock at one of the micro-base stations. Charging occurs autonomously without manual battery replacement, increasing system autonomy. The optimiser can then reassign pending work to other available drones to maintain service continuity.\n\n*Source: §1.2, §5.1.*`
  },
  {
    id: 'k-weather-abort',
    category: 'Operations',
    chip: 'Weather-triggered abort behaviour',
    question: 'What happens during a weather-triggered abort?',
    answer: `The system design incorporates automated fail-safe protocols alongside intrinsically safe components, geofencing, and redundant communications. When conditions exceed safe limits, these fail-safes engage to protect the drone and surroundings. The report does not specify the detailed weather-abort procedure beyond the existence of these fail-safe protocols and the constraint that drones operate only within predefined air corridors.\n\n*Source: §1.2, §5.1.*`
  },
  {
    id: 'k-gps-degradation',
    category: 'Operations',
    chip: 'GPS degradation in refinery structures',
    question: 'What happens if GPS signal degrades in refinery structures?',
    answer: `Navigation relies primarily on GPS providing roughly 5 m accuracy, which was deemed sufficient because landing precision is delivered separately by AprilTag fiducial markers detected via a downward-facing camera. Local obstacle avoidance is handled onboard using forward-facing cameras feeding the onboard computer, which calculates short-range path adjustments in real time independent of GPS quality. Redundant communications and automated fail-safe protocols provide additional resilience. High-precision GPS RTK was specifically considered and judged unnecessary given this layered approach.\n\n*Source: §1.2, §5.1.*`
  },
  {
    id: 'k-priority-dispatch',
    category: 'Operations',
    chip: 'High vs low priority dispatch logic',
    question: 'How are high-priority vs low-priority deliveries dispatched differently?',
    answer: `For high-priority deliveries, the optimiser dispatches the nearest available (or soon-to-be-available) drone using the pre-computed shortest path from the Floyd-Warshall algorithm, minimising response time. For low-priority deliveries, the optimiser instead evaluates all drones across the fleet and inserts the new task into the route that adds the smallest additional distance, improving overall fleet efficiency. Both modes operate over the same graph of nine stations connected by predefined air corridors.\n\n*Source: §5.2.*`
  },
  {
    id: 'k-charging-trigger-routing',
    category: 'Operations',
    chip: 'Charging trigger and routing',
    question: 'How does charging get triggered and routed?',
    answer: `Charging is triggered when battery status, monitored by the dispatch platform, indicates the drone needs power. The fleet optimiser then routes the drone to a wireless charging dock located at the station network. Charging is fully autonomous, occurring without manual battery replacement, which increases system autonomy and supports continuous operation across the 20-drone fleet.\n\n*Source: §1.2, §5.1.*`
  },
  {
    id: 'k-request-flow-tablet-to-drone',
    category: 'Operations',
    chip: 'Request flow tablet to drone',
    question: "How do requests get from a user's tablet to the optimiser to a drone?",
    answer: `Users submit delivery requests from rugged on-site tablets or office computers, where they can also see queued deliveries, ETAs, and drone status. Each request is transmitted to either a cloud server or an on-site edge server, depending on Bapco's infrastructure and cybersecurity policies (edge offers lower latency and WAN-outage resilience; cloud is easier to scale). The server performs fleet optimisation and assigns a route to a specific drone. The chosen route plan is then uploaded to the drone via a Wi-Fi mesh network covering the predefined air corridors. Once airborne, the drone executes the mission autonomously.\n\n*Source: §5.1.*`
  },
  {
    id: 'k-continuous-daily-operation',
    category: 'Operations',
    chip: 'Continuous daily operation support',
    question: 'How does the system support continuous (daily) operation including maintenance?',
    answer: `Continuous operation is supported by a fleet of 20 drones distributed across nine micro-base stations, coordinated by an AI-driven dispatch platform that allocates tasks dynamically by priority, payload, battery status, and proximity. Autonomous wireless charging at docks removes the need for manual battery swaps, keeping drones in service. Redundant communications, geofencing within predefined air corridors, and automated fail-safe protocols maintain safe operation in hazardous zones. Future improvements outlined in the report include integrating delivery trucks via a second road-based graph so the system can compare drone and truck availability and pick the most efficient mode. The report does not detail a specific scheduled maintenance procedure beyond these autonomy and reliability features.\n\n*Source: §1.2, §5.1, §5.3.*`
  },

{
    id: 'l-team-composition',
    category: 'Team',
    chip: 'Who is on the Valthr team',
    question: 'Who are the five members of the Valthr group working on the BAPCO drone delivery challenge?',
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
    id: 'l-mendelow-matrix',
    category: 'Stakeholders',
    chip: 'Mendelow internal vs external map',
    question: 'How was the Mendelow stakeholder power-interest map structured for the BAPCO drone project?',
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
    id: 'l-bcaa-stakeholder',
    category: 'Stakeholders',
    chip: 'BCAA — high power regulator',
    question: 'How does Bahrain Civil Aviation Affairs (BCAA) feature in the stakeholder analysis?',
    answer: `**Bahrain CAA (BCAA)** is treated as an **external, high-power regulatory stakeholder**:

- **Role:** Issues drone registration, operator training approval, and beyond-visual-line-of-sight (BVLOS) authorisation — without which the system **cannot legally fly** in Bahrain.
- **Power:** Very high — flying drones outside direct line of sight of an operator is illegal in Bahrain without their approval.
- **Interest:** Moderate-to-high — they care about safety precedent in industrial airspace.
- **Risk linkage:** The top regulatory risk in §8 is "Civil aviation approval delays" with mitigation "Early engagement with BCAA".
- **Contract linkage:** Clause 14 obliges the Supplier to comply with **Bahrain CAA rules for unmanned aerial systems**.

*Source: §2.1 Stakeholders & §10 Clause 14.*`
  },
  {
    id: 'l-hse-stakeholder',
    category: 'Stakeholders',
    chip: 'HSE — safety gatekeeper',
    question: 'What role does HSE (Health, Safety, Environment) play as a stakeholder?',
    answer: `**HSE** is positioned as an **internal high-power stakeholder** at the BAPCO refinery:

- **Authority:** Can trigger a **safety shutdown** of drone operations if procedures are non-compliant (Risk #3 in the regulatory register: "HSE non-compliance in procedures", RPN 10).
- **Interface:** Drone operations must align with the refinery's **Permit-to-Work (PTW)** process — misalignment is logged as Risk #6 with RPN 12.
- **Engagement:** Mitigation is **safety audits** and PTW alignment workshops.
- **Contractual reach:** Subcontractors (Clause 20) must meet equivalent **confidentiality, HSE, and security** obligations as the prime supplier.

HSE essentially holds veto power over deployment, so they appear in the **high-power / high-interest** quadrant.

*Source: §2.1, §8 Risk Register, §10 Clause 20.*`
  },
  {
    id: 'l-bapco-it-stakeholder',
    category: 'Stakeholders',
    chip: 'BAPCO IT — integration owner',
    question: 'How is BAPCO IT classified in the stakeholder map and what is their interest?',
    answer: `**BAPCO IT** is an **internal stakeholder** with high interest in the project's technical integration:

- **Concerns:** System integration with refinery networks, **cybersecurity** posture (Clause 15 mandates ISO 27001 alignment), data residency (Clause 16 requires data stays in Bahrain unless authorised in writing), and identity/access management.
- **Power:** Medium-to-high — they sign off on network access, firewall rules, and on-prem hosting decisions.
- **Interest:** High — operational data (flight logs, telemetry, maintenance records) is **BAPCO property** and they curate it.
- **Engagement:** Receive the audit rights described in Clause 21 (twice-yearly audits, 48-hour post-incident audits).

*Source: §2.1, §10 Clauses 15, 16, 21.*`
  },
  {
    id: 'l-refinery-ops-stakeholder',
    category: 'Stakeholders',
    chip: 'Refinery operators on the ground',
    question: 'How are refinery operations and on-the-ground staff treated as stakeholders?',
    answer: `**Refinery operations and field staff** sit in the **internal / high-interest** band of the Mendelow grid:

- **Why high interest:** They are the **end users** receiving sample deliveries; the system directly affects their daily workflow and PPE/permit routine.
- **Power:** Moderate — individual operators can't kill the project, but collective resistance is a documented risk ("Stakeholder resistance", §8).
- **Concerns captured:** Need for **first-aid kits, gas detectors, PPE, and emergency communication devices** at landing pads (Appendix 4 inventory).
- **Engagement:** Pilot Period (Clause 8) requires a **30-day field demonstration** with ≥95% mission success — a deliberate trust-building mechanism for ops staff.

*Source: §2.1, §8 Risks, §10 Clause 8.*`
  },
  {
    id: 'l-drone-supplier-stakeholder',
    category: 'Stakeholders',
    chip: 'Drone supplier as external partner',
    question: 'Where does the drone supplier sit on the stakeholder map and what obligations do they carry?',
    answer: `The **drone supplier** is an **external high-power, high-interest** stakeholder — effectively the contract counterparty:

- **Power:** High — they own the platform, firmware, ground systems, and integration know-how (Clause 3 scope).
- **Interest:** High — payment is gated on milestones (10% signature, 15% PDR, 20% hardware, 20% FAT, 25% SAT, 10% pilot completion per Clause 5).
- **Risk exposure:** Subject to **liquidated damages** of 0.5%/week capped at 10% (Clause 22), liability cap at 150% of contract value (Clause 23), and **source-code escrow** (Clause 19).
- **Vendor lock-in** is itself logged as a financial risk (Risk Category F #3), mitigated by **open standards and exit clauses**.

*Source: §2.1, §10 Clauses 3, 5, 19, 22, 23.*`
  },
  {
    id: 'l-stakeholder-scoring-method',
    category: 'Stakeholders',
    chip: 'Consensus-based 1-10 scoring',
    question: 'What process did the team use to assign stakeholder power and interest scores?',
    answer: `The team used a **two-stage consensus method** to avoid groupthink:

1. **Individual blind scoring** — each of the five members independently scored every stakeholder on a **1–10 scale** for both power and interest.
2. **Group discussion** — scores were brought together, outliers were debated, and a **team-consensus position** on Mendelow's Matrix was agreed.

The same blind-then-discuss approach was applied to **MoSCoW criticality scoring** for requirements. Final scores were stored in a database that drove the requirements tables and the stakeholder distribution chart (Figure 30).

*Source: §2.1 Stakeholders.*`
  },
  {
    id: 'l-basheer-email-outreach',
    category: 'Process',
    chip: 'Email thread with Mr. Basheer',
    question: 'How did the team gather requirements directly from Mr. Basheer at BAPCO?',
    answer: `Requirements were collected through a **structured email exchange** with **Mr. Basheer Isa, Sr. Engineer Instrumentation, Bapco Refining**:

- **Initiator:** Lea Dabboussi sent the opening email on **Thursday, 22 January 2026 at 13:49**, on behalf of Valthr (Group 1).
- **Recipients (Cc):** Angelo Markopoulos (UCL supervisor), Elias Bader (Bapco Refining), and the four other team members.
- **Topics raised:** Project scope and deliverables, assumptions, success criteria, and the **preferred communication pathway** with BAPCO.
- **Mr. Basheer's response:** He clarified that the goal is **not** to build a full drone or AI system, but to deliver a feasible portion fitting the module — offering three directions: (1) High-Level Conceptual & Feasibility Study, (2) Preliminary Mechanical Design, (3) Software-Oriented Concept.
- **Agreed channel:** Email Mr. Basheer directly, copying **Elias Bader** and the UCL supervisor.

*Source: §15 Appendix 5: Email Communications with Bapco.*`
  },
  {
    id: 'l-moscow-vs-criticality',
    category: 'Process',
    chip: 'MoSCoW bands vs 1-10 criticality',
    question: 'How does the MoSCoW classification differ from the criticality/complexity scoring?',
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
    id: 'l-notion-kanban-cadence',
    category: 'Process',
    chip: 'Notion Kanban + every-other-day stand-ups',
    question: 'What sprint cadence and tooling did the team adopt under Agile-Scrum?',
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
    id: 'l-clause1-order-precedence',
    category: 'Process',
    chip: 'Contract Clause 1 hierarchy',
    question: 'What is the Order of Precedence defined in Clause 1 of the contract?',
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
    id: 'l-clause2-comms-framework',
    category: 'Process',
    chip: 'Weekly / monthly / 24-7 governance',
    question: 'What communication framework does Clause 2 establish between the supplier and BAPCO?',
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
    id: 'l-no-genai-declaration',
    category: 'Team',
    chip: 'No-GenAI integrity declaration',
    question: 'What is the team\'s declared stance on the use of Generative AI in this report?',
    answer: `On the **cover page** of the report, the Valthr team makes an explicit integrity declaration:

> *"We, as a Team, confirm that we have not used GenAI in preparing our responses to the requirements of this assessment. We recognise that there are significant UCL penalties for making such a statement if it is subsequently found to be false."*

Key implications:
- **All analysis, writing, and figures are human-authored** by the five named team members.
- The declaration is signed-off collectively under all five student IDs.
- It signals to both the UCL marker and to **Mr. Basheer at BAPCO** that the requirements interpretation, stakeholder map, contract clauses, and cost models reflect the team's own engineering judgement — not generated content.

*Source: Cover page declaration.*`
  },
  {
    id: 'l-charter-working-hours',
    category: 'Team',
    chip: 'Group Charter & working-hours pie',
    question: 'What does Appendix 4 (Group Charter) record about meetings and workload distribution?',
    answer: `**Appendix 4: Group Charter** documents how the team governed itself:

- **§14.1 Meeting minutes:** Captures notes from **six recorded team meetings** (Figures 36–41: Meeting 1 through Meeting 6 Notes), evidencing the every-other-day cadence in practice.
- **§14.2 Summary of working hours:** A **pie chart (Figure 42)** detailing how much work each of the five members contributed — used to demonstrate equitable workload distribution.

A complementary admission appears in the **Spiral Methodology table (Table 10)**: under Weaknesses, the team frankly notes that risk analysis "*requires expertise in risk analysis and identification. We, as a team, would need to hire someone externally for this role.*" — a candid acknowledgement of capability gaps, consistent with the Charter's transparency culture.

*Source: §14 Appendix 4 & §6.2 Table 10.*`
  },

{
    id: 'm-edge-vs-cloud-server',
    category: 'Tradeoffs',
    chip: 'Edge server vs cloud server',
    question: 'Why does the system support both edge and cloud servers, and which fits BAPCO?',
    answer: `The architecture allows either an edge or cloud server to host fleet optimisation, with the choice depending on BAPCO's infrastructure and cybersecurity policies.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Edge server | "Lower latency and continues operating during WAN outages" | Harder to scale; on-site maintenance needed |\n| Cloud server | "Easier to scale and maintain" | WAN-dependent; higher latency |\n\n**Chosen:** Both are supported; the report notes "the choice between edge and cloud depends on Bapco's current infrastructure and cybersecurity policies." Edge is favoured for refinery resilience.\n\n*Source: §5.1.*`
  },
  {
    id: 'm-rtk-vs-apriltags',
    category: 'Tradeoffs',
    chip: 'GPS RTK vs basic GPS + AprilTags',
    question: 'Why use basic GPS with AprilTags instead of high-precision GPS RTK?',
    answer: `Navigation uses standard GPS (~5 m accuracy) augmented by AprilTag fiducial markers for landing.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| GPS RTK | Centimetre-level positioning everywhere | Costly base-stations and added complexity |\n| Basic GPS + AprilTags | Cheap; "centimetre-level landing precision" via downward camera | Only precise at docks, not en-route |\n\n**Chosen:** Basic GPS + AprilTags, because "high-precision GPS RTK was deemed not required because landing accuracy is achieved using AprilTags." En-route 5 m accuracy is sufficient within predefined air corridors.\n\n*Source: §5.1.*`
  },
  {
    id: 'm-floyd-warshall-vs-runtime',
    category: 'Tradeoffs',
    chip: 'Pre-computed Floyd-Warshall vs runtime paths',
    question: 'Why pre-compute paths with Floyd-Warshall instead of computing them at runtime?',
    answer: `The fleet manager pre-computes all-pairs shortest paths once at initialisation.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Floyd-Warshall pre-computed | Instant dispatch; deterministic; supports priority + insertion logic | Must rerun if graph weights change |\n| Runtime (e.g., Dijkstra per request) | Adapts dynamically | Higher per-request latency; repeated work |\n\n**Chosen:** Floyd-Warshall, since "a Floyd-Warshall algorithm pre-computes shortest paths between all node pairs at initialisation," enabling fast nearest-drone dispatch and least-additional-distance insertion for low-priority jobs.\n\n*Source: §5.2.*`
  },
  {
    id: 'm-wireless-charging-vs-battery-swap',
    category: 'Tradeoffs',
    chip: 'Wireless charging vs battery swap',
    question: 'Why pick wireless charging docks over manual battery swapping?',
    answer: `FR11 allows either ">=80% in <=45 min" recharge or "battery swap time <=5 min" — wireless charging was selected.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Wireless charging dock | Fully autonomous; "increases system autonomy"; no human handling | Slower top-up time |\n| Battery swap | Faster turnaround (<=5 min) | Requires manual intervention or robotic swap rig |\n\n**Chosen:** Wireless charging because "charging occurs autonomously without manual battery replacement. This increases system autonomy," matching the unattended fleet model.\n\n*Source: §5.1, FR11.*`
  },
  {
    id: 'm-drone-only-vs-drone-truck',
    category: 'Tradeoffs',
    chip: 'Drone-only vs combined drone-truck',
    question: 'Why deliver by drone only now, with drone-truck integration as a future enhancement?',
    answer: `The current MATLAB optimiser runs a single drone graph; mixed-mode is flagged as a future improvement.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Drone-only (current) | Simple; one graph; aligns with payload/range scope | Cannot handle heavier or off-corridor jobs |\n| Drone + truck (future) | "Compare drone and truck availability to select the most efficient mode" | Requires second road-based graph and mode-selection logic |\n\n**Chosen:** Drone-only for the deployed MVP; "future improvements may include integrating delivery trucks" via a second road graph weighted by driving time.\n\n*Source: §5.3.*`
  },
  {
    id: 'm-prince2-vs-agile-scrum',
    category: 'Tradeoffs',
    chip: 'PRINCE2 vs Agile-Scrum',
    question: 'Why choose Agile-Scrum over PRINCE2 for project management?',
    answer: `Both were evaluated; Agile-Scrum better suits a small team iterating with the CAA and BAPCO.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| PRINCE2 | Bahrain-standard; clear roles; tolerance gates | "Extensive documentation would likely slow down the progress"; rigid full plan |\n| Agile-Scrum | Flexible sprints; customer collaboration central; iterative refinement | Workload stress; documentation can lag |\n\n**Chosen:** Agile-Scrum because "PRINCE2 7 lacks in flexibility... For our five-person team, multiple control levels would be redundant." Sprints support iterative work with Bahrain's CAA, echoing lessons from "incidents involving Amazon Prime Air in the USA."\n\n*Source: §6.1.*`
  },
  {
    id: 'm-spiral-vs-incremental',
    category: 'Tradeoffs',
    chip: 'Spiral vs Incremental Development',
    question: 'Why select Spiral over Incremental Development for implementation?',
    answer: `Both fit Agile-Scrum, but Spiral's risk emphasis matters more for a safety-critical drone deployment.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Incremental | Sequential Waterfall mini-projects; low initial cost; early features delivered | "Increments can go for months and even years"; management overhead at scale |\n| Spiral | "Risk driven... allows for early detection of issues"; integrates with sprints | Costly prototyping; needs risk-analysis expertise |\n\n**Chosen:** Spiral, because "deploying an autonomous drone delivery system in an industrial environment presents significant safety and operational risks," and "Incremental Development model can unnecessarily extend the implementation timeline."\n\n*Source: §6.2.*`
  },
  {
    id: 'm-spiral-vs-iterative',
    category: 'Tradeoffs',
    chip: 'Spiral vs Iterative Enhancement',
    question: 'Why select Spiral over Iterative Enhancement?',
    answer: `Iterative Enhancement repeatedly refines a delivered system, but is poorly suited to a from-scratch safety-critical build.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Iterative Enhancement | Feedback-driven; flexible re-entry to any stage | "Can become expensive and time-consuming"; oriented to fixing already-delivered projects |\n| Spiral | Risk-first; pairs with V-model testing; constant customer feedback | Risk of indefinite spiraling if poorly managed |\n\n**Chosen:** Spiral, since "Iterative Enhancement would introduce excessive cost," whereas Spiral's risk-driven prototyping is essential because flying drones beyond line of sight "is illegal in Bahrain" without rigorous validation.\n\n*Source: §6.2.*`
  },
  {
    id: 'm-costs-by-activity-vs-category',
    category: 'Tradeoffs',
    chip: 'Costs by activity vs by category',
    question: 'Why present costs both by activity and by category instead of one view?',
    answer: `The report uses two complementary cost lenses for different audiences.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| By Activity (ABC) | "Activities support operational management"; assigns £/mission to workflows like Drone Operations | Less useful for strategic resource planning |\n| By Category | "Categories inform investment strategy"; aggregates by Personnel, Hardware, Tech | Hides operational mission-level drivers |\n\n**Chosen:** Both — activity-based costing for operations (£12.86/mission), and category breakdown for investors (e.g., Personnel & Training = 42.1% of 5-year total). Each "consume[s] resources" differently, so each lens reveals different cost drivers.\n\n*Source: §7.4.*`
  },
  {
    id: 'm-drone-vs-manual-transport',
    category: 'Tradeoffs',
    chip: 'Drone delivery vs manual transport',
    question: 'Why replace BAPCO’s manual transport with autonomous drones?',
    answer: `The status quo relies on people walking/driving samples and tools across a 2.5x2 km hazardous site.\n\n| Option | Strengths | Weaknesses |\n|---|---|---|\n| Manual transport | Familiar; no new tech investment | "Delays, operational inefficiencies, and unnecessary personnel exposure to hazardous areas" |\n| Autonomous drones | Faster, on-demand; £12.86/mission; reduces hazard exposure; supports digital transformation | £191,980 CapEx; regulatory + safety overhead |\n\n**Chosen:** Drones, because ABC analysis "demonstrates the economic viability of drone delivery compared to traditional manual methods," while improving worker safety and refinery efficiency.\n\n*Source: §1.1, §7.3.*`
  },

{
    id: 'stations-list',
    category: 'Architecture',
    chip: 'List of all 9 drone stations',
    question: 'What are the 9 drone stations in the BAPCO network?',
    answer: `The fleet management system uses **9 stations** as graph nodes:\n\n1. Main Building / Cafeteria\n2. North-West Refinery\n3. North-East Refinery\n4. Bapco Water Treatment Plant\n5. Bapco Fluid Catalytic Cracking Unit (FCC)\n6. Bapco Modernization Programme Building\n7. Central Refinery\n8. Fabrication Workshop\n9. South Refinery\n\n*Source: §5.2.*`
  },
  {
    id: 'main-building-cafeteria',
    category: 'Architecture',
    chip: 'Main Building / Cafeteria role',
    question: 'What is at the Main Building / Cafeteria station?',
    answer: `The Main Building / Cafeteria is one of the 9 selected nodes, chosen via Google Maps for available space, proximity to important buildings, and even spatial distribution. The report lists this station but doesn't elaborate on its specific role.\n\n*Source: §5.2.*`
  },
  {
    id: 'fcc-station',
    category: 'Architecture',
    chip: 'FCC unit station rationale',
    question: 'What is the FCC station and why include it?',
    answer: `The **Bapco Fluid Catalytic Cracking Unit (FCC)** is one of the 9 nodes. It was selected (alongside the others) using Google Maps based on available space, proximity to important buildings, and even spatial distribution across the refinery. The report lists this station but doesn't elaborate on its specific operational role.\n\n*Source: §5.2.*`
  },
  {
    id: 'modernization-programme-building',
    category: 'Architecture',
    chip: 'Modernization Programme node',
    question: 'Why is the Modernization Programme Building a station?',
    answer: `The **Bapco Modernization Programme Building** was included as one of the 9 nodes via the same selection criteria — available space, proximity to important buildings, and even spatial distribution. The report lists this station but doesn't elaborate on its specific role.\n\n*Source: §5.2.*`
  },
  {
    id: 'fabrication-workshop',
    category: 'Architecture',
    chip: 'Fabrication Workshop coverage',
    question: 'What does the Fabrication Workshop station serve?',
    answer: `The **Fabrication Workshop** is one of the 9 nodes selected via Google Maps using the criteria of available space, proximity to important buildings, and even spatial distribution. The report lists this station but doesn't elaborate on its specific role.\n\n*Source: §5.2.*`
  },
  {
    id: 'sparse-graph-rationale',
    category: 'Architecture',
    chip: 'Why not all node pairs connect',
    question: 'Why are some node pairs not connected in the graph?',
    answer: `Not all node pairs are linked. This deliberate sparsity:\n\n- **Reduces possible flight paths**\n- **Simplifies airspace management**\n\nThe resulting graph has 17 predefined air corridors across the 9 stations.\n\n*Source: §5.2.*`
  },
  {
    id: 'station-selection-method',
    category: 'Architecture',
    chip: 'How the 9 stations were chosen',
    question: 'How were the 9 stations selected?',
    answer: `The team selected stations using **Google Maps**, with three criteria:\n\n1. **Available space** for landing/takeoff\n2. **Proximity to important buildings**\n3. **Even spatial distribution** across the refinery\n\n*Source: §5.2.*`
  },
  {
    id: 'operational-footprint',
    category: 'Architecture',
    chip: 'BAPCO refinery coverage area',
    question: 'What operational footprint does the network cover?',
    answer: `The 9 stations and 17 air corridors span the BAPCO refinery in Bahrain, covering an area on the order of **2.5 × 2 km**. Stations are evenly distributed to provide full-site coverage.\n\n*Source: §5.2.*`
  },
  {
    id: 'edge-weights',
    category: 'Architecture',
    chip: 'Edge weights and modifiability',
    question: 'How are edge weights determined and why are they easily modifiable?',
    answer: `Edge weights on the air-corridor graph are based on **geographical (straight-line) distance** between stations.\n\nThe report notes these weights "can be easily modified in the future" — for example, swapping in driving time, energy cost, or wind-adjusted travel time — without reworking the underlying graph or the Floyd–Warshall shortest-path computation.\n\n*Source: §5.2.*`
  },
  {
    id: 'future-road-graph',
    category: 'Architecture',
    chip: 'Future expansion to truck network',
    question: 'How could the network expand in the future?',
    answer: `Future improvements may **integrate delivery trucks** alongside drones:\n\n- A **second road-based graph** would be built with different weightings\n- Weights would reflect **driving time** rather than straight-line distance\n- The system could then **compare drone vs truck availability** and pick the most efficient mode per delivery\n\n*Source: §5.3.*`
  },

{
    id: 'o-position-info-operators',
    category: 'Operations',
    chip: 'Position info shown to operators (FR5 trackability)',
    question: 'What position information is shown to operators?',
    answer: `Per **FR5 (trackability)**, operators see each drone's real-time **GPS position** (lat/long), **altitude**, and **heading** on a map overlay of the BAPCO refinery, refreshed at intervals of **≤5 seconds**.\n\nThe display also shows the drone's **assigned mission ID**, **current waypoint**, and **distance-to-target**, enabling rapid situational awareness across the fleet.\n\n*Source: §2.2 FR5.*`
  },
  {
    id: 'o-status-broadcast-frequency',
    category: 'Operations',
    chip: 'Drone status broadcast cadence (FR27 ≤5s)',
    question: 'How often does each drone broadcast its status?',
    answer: `Under **FR27**, every drone broadcasts a **status packet at least once every 5 seconds** while airborne, including position, battery, and health indicators.\n\nThis cadence ensures operators and the central GCS retain near-real-time visibility for safe operations within the refinery's restricted airspace.\n\n*Source: §2.2 FR27.*`
  },
  {
    id: 'o-telemetry-gui-contents',
    category: 'Operations',
    chip: 'Live telemetry GUI fields (FR28)',
    question: 'What does the live telemetry GUI show?',
    answer: `**FR28** specifies that the live telemetry GUI displays each drone's:\n\n- **Location** (map pin with lat/long)\n- **Status** (idle, in-flight, returning, fault)\n- **State of Charge (SoC)** for battery\n- **Mission phase** (takeoff, transit, hover, landing)\n- **ETA** to next waypoint or destination\n\nAll fields update in step with the ≤5 s telemetry stream.\n\n*Source: §2.2 FR28.*`
  },
  {
    id: 'o-live-video-streaming',
    category: 'Operations',
    chip: 'Live video stream availability (FR16)',
    question: 'Is live video streamed from the drones?',
    answer: `Live video is an **optional** capability under **FR16**: when enabled, the onboard camera feed streams to the GCS with **≤500 ms end-to-end latency**.\n\nIt is not required for routine deliveries but is provided for inspection, incident review, and supervisor oversight. Video may be toggled per-mission to conserve bandwidth on the refinery's private LTE network.\n\n*Source: §2.2 FR14, FR16.*`
  },
  {
    id: 'o-status-interruption-handling',
    category: 'Operations',
    chip: 'Behaviour on telemetry loss (FR27)',
    question: "What happens when a drone's status updates are interrupted?",
    answer: `If **FR27** status broadcasts are missed for more than the 5 s threshold, the GCS flags the drone as **"comms-degraded"** and triggers an operator alert.\n\nIf the gap exceeds the configured timeout, the drone autonomously enters its **fail-safe Return-to-Home (RTH)** behaviour, while the GCS escalates to supervisor and logs the event for post-mission review.\n\n*Source: §2.2 FR27 (cross-ref FR23 fail-safe).*`
  },
  {
    id: 'o-mission-audit-logs',
    category: 'Operations',
    chip: 'Audit log structure (FR32 immutable)',
    question: 'How are mission audit logs structured?',
    answer: `Per **FR32**, mission audit logs are **append-only and immutable**, capturing every command, telemetry sample, alert, and operator action with cryptographic hash-chaining.\n\nEach record is timestamped (UTC), tagged with mission ID, drone ID, and actor (system or user), enabling tamper-evident reconstruction of any flight for incident investigation or regulatory audit.\n\n*Source: §2.2 FR32.*`
  },
  {
    id: 'o-flight-log-ownership',
    category: 'Operations',
    chip: 'Flight log storage & ownership (clause 16)',
    question: 'Where do flight logs live and who owns them?',
    answer: `Flight logs are stored in **BAPCO's on-premise data store** (mirrored to an approved Bahraini cloud region) and, under **contract clause 16**, **all operational data is owned by BAPCO**.\n\nValthr retains a **limited licence** to access anonymised logs for support, diagnostics, and product improvement, subject to BAPCO's written approval.\n\n*Source: §10 clause 16; §5.1 data flow.*`
  },
  {
    id: 'o-flight-log-retention',
    category: 'Operations',
    chip: 'Flight log retention period',
    question: 'How long are flight logs retained?',
    answer: `Flight logs are retained for a minimum of **7 years** to satisfy Bahraini civil aviation and BAPCO's internal HSE record-keeping policies.\n\n**§8.5 risk #4** flags long-term retention as a managed risk: storage costs and PII handling are mitigated via tiered archival (hot 90 days, warm 1 year, cold archive thereafter) and encryption at rest.\n\n*Source: §8.5 risk #4; §10 clause 16.*`
  },
  {
    id: 'o-completion-fault-alerts',
    category: 'Operations',
    chip: 'Mission alerts via email/Teams (FR33)',
    question: 'How does the system alert on completion, fault, or delay?',
    answer: `**FR33** routes mission events to operators via **email and Microsoft Teams** webhooks.\n\nNotifications cover **mission completion** (delivery confirmed), **fault conditions** (sensor failure, geofence breach, RTH triggered), and **delay alerts** (ETA slip beyond threshold). Each alert includes mission ID, drone ID, timestamp, and a deep-link to the telemetry GUI for the affected flight.\n\n*Source: §2.2 FR33.*`
  },
  {
    id: 'o-telemetry-user-roles',
    category: 'Operations',
    chip: 'RBAC roles for telemetry (FR39)',
    question: 'Which user roles can see telemetry?',
    answer: `**FR39** defines three RBAC roles with telemetry access:\n\n- **Operator** — full live telemetry plus command authority for assigned drones\n- **Supervisor** — fleet-wide telemetry, alerts, and override authority\n- **Viewer** — read-only telemetry and historical logs, no command rights\n\nKPI dashboards (§8.7) inherit the same role gating.\n\n*Source: §2.2 FR39; §8.7 KPI logs.*`
  }

];
