# State Diagram — Ownership Transfer

**Report section:** 3.1.3 Dynamic modelling

Lifecycle of the `Transfer.status` field (`TransferStatus` enum), driven by
`TransferService`.

```mermaid
stateDiagram-v2
    [*] --> INITIATED : citizen initiates<br/>(price > 0, no pending transfer)
    INITIATED --> OFFICER_VERIFIED : officer verifies
    INITIATED --> REJECTED : admin rejects
    INITIATED --> CANCELLED : seller cancels
    OFFICER_VERIFIED --> ADMIN_APPROVED : admin approves<br/>(ownership + hash rechain + tree rebuild)
    OFFICER_VERIFIED --> REJECTED : admin rejects
    ADMIN_APPROVED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]

    note right of ADMIN_APPROVED
        Terminal & irreversible:
        current ownership closed,
        new OwnershipHistory row,
        chain re-linked, Merkle tree
        rebuilt (new tree_version).
    end note

    classDef pending fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef success fill:#f0fdf4,stroke:#16a34a,color:#14532d,font-weight:bold
    classDef failure fill:#fef2f2,stroke:#dc2626,color:#7f1d1d

    class INITIATED,OFFICER_VERIFIED pending
    class ADMIN_APPROVED success
    class REJECTED,CANCELLED failure
```

> **Note:** `CANCELLED` exists in the `TransferStatus` enum but no controller
> endpoint currently sets it. The `INITIATED → CANCELLED` edge is shown as
> designed behaviour; drop it if you only want to depict implemented transitions.
