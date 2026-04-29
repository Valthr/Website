// qa.js — Precomputed Q&A pairs for the Valthr research assistant.
// Answers are grounded in the Valthr Group Report (assets/GROUP_01_Drone Delivery.pdf).
// See assets/js/chatbot.js for the consumer.

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
  }

];
