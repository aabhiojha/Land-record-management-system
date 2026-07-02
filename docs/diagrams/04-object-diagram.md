# Object Diagram

**Report section:** 3.1.3 Object modelling

A concrete snapshot: kitta *KIT-045* transferred from Ram to Gita, officer-verified
and admin-approved (mirrors the demo flow in the README).

```mermaid
%%{init: {'flowchart': {'curve': 'linear'}}}%%
flowchart TB
    ram["ram : User<br/>role = CITIZEN<br/>fullName = Ram Bahadur"]
    gita["gita : User<br/>role = CITIZEN<br/>fullName = Gita Sharma"]
    hari["hari : User<br/>role = MALPOT_OFFICER"]
    admin["admin : User<br/>role = SUPER_ADMIN"]

    rec["rec : LandRecord<br/>kittaNumber = KIT-045<br/>landType = KHET<br/>currentOwner = gita<br/>recordHash = 9af3…"]

    tr["tr : Transfer<br/>status = ADMIN_APPROVED<br/>price = 2,500,000<br/>tax = 125,000<br/>oldHash = 41bc…  newHash = 9af3…"]

    h1["h1 : OwnershipHistory<br/>owner = ram<br/>ownedUntil = 2026-06-30"]
    h2["h2 : OwnershipHistory<br/>owner = gita<br/>ownedUntil = null (current)"]

    tr -->|landRecord| rec
    tr -->|seller| ram
    tr -->|buyer| gita
    tr -->|verifiedBy| hari
    tr -->|approvedBy| admin
    rec -->|currentOwner| gita
    rec --> h1
    rec --> h2
    h1 -->|owner| ram
    h2 -->|owner| gita
    h2 -->|transfer| tr

    classDef actor fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#1c1917
    classDef record fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef transfer fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef history fill:#fafafa,stroke:#94a3b8,color:#334155

    class ram,gita,hari,admin actor
    class rec record
    class tr transfer
    class h1,h2 history
```
