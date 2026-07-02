# System Diagrams — Land Record Management System

Diagrams for the project report, generated from the actual codebase (Spring Boot
backend + React frontend, PostgreSQL, SHA-256 Hash Chain + Merkle Tree). This
project follows the **object-oriented analysis and design** approach; the ER
diagram is included as the database-design artifact for Chapter 4.

All diagrams are written in [Mermaid](https://mermaid.js.org/). They render on
GitHub, in VS Code (*Markdown Preview Mermaid* extension), JetBrains IDEs, and on
<https://mermaid.live>. To export for the report, paste a diagram into
mermaid.live and use *Actions → Download SVG/PNG*.

One file per diagram:

| # | File | Diagram | Report section |
|---|------|---------|----------------|
| 1 | [01-use-case.md](01-use-case.md) | Use Case (per role) | 3.1.1 Functional Requirements |
| 2 | [02-er-diagram.md](02-er-diagram.md) | Entity Relationship | 4.1 Database Design |
| 3 | [03-class-diagram.md](03-class-diagram.md) | Class | 3.1.3 / 4.1 Object modelling |
| 4 | [04-object-diagram.md](04-object-diagram.md) | Object | 3.1.3 Object modelling |
| 5 | [05-state-transfer.md](05-state-transfer.md) | State — Transfer lifecycle | 3.1.3 Dynamic modelling |
| 6 | [06-sequence-transfer.md](06-sequence-transfer.md) | Sequence — Ownership transfer | 3.1.3 Dynamic modelling |
| 7 | [07-sequence-verification.md](07-sequence-verification.md) | Sequence — Integrity verification | 3.1.3 Dynamic modelling |
| 8 | [08-activity-transfer.md](08-activity-transfer.md) | Activity — End-to-end transfer | 3.1.3 Process modelling |
| 9 | [09-activity-create-record.md](09-activity-create-record.md) | Activity — Create record & hashing | 3.1.3 Process modelling |
| 10 | [10-component-diagram.md](10-component-diagram.md) | Component | 4.1 Component Diagram |
| 11 | [11-deployment-diagram.md](11-deployment-diagram.md) | Deployment | 4.1 Deployment Diagram |
| 12 | [12-system-flowchart.md](12-system-flowchart.md) | System Flowchart (overall program flow) | supplementary |

Rendered images (SVG + high-res PNG) for every diagram are in [`images/`](images/).

---

*Generated from the codebase on 2026-07-02. If the schema or workflow changes,
re-derive from `db/migration/*.sql`, the `*Service.java` classes, and the
controller mappings.*
