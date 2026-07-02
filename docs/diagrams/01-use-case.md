# Use Case Diagram

**Report section:** 3.1.1 Functional Requirements

Three actors — **Citizen**, **Malpot Officer**, **Super Admin (Nepal Sarkar)** —
in a single system-boundary diagram. Shared use cases (login, integrity
verification, hash-chain verification, logout) connect to all three actors.
Colour key: **rose** = use cases that carry an «include»/«extend» branch,
**gray** = plain views/actions, **green** = shared verification, **yellow** =
session/account. Derived from the controller endpoints and their role
restrictions.

> **Note on «include» / «extend» direction:** to match the common textbook
> layout the branch use cases are drawn to the *right* of their base
> (`base -.-> branch`). Strict UML draws the «extend» arrowhead on the base
> (extension → base); flip those lines if your supervisor requires it.

```mermaid
%%{init: {'themeVariables': {'fontSize': '22px'}, 'flowchart': {'curve': 'linear', 'nodeSpacing': 130, 'rankSpacing': 220, 'padding': 30, 'diagramPadding': 30}}}%%
flowchart LR
    citizen["👤<br/><b>Citizen</b>"]
    officer["🧑‍💼<br/><b>Malpot Officer</b>"]
    admin["🏛️<br/><b>Super Admin</b><br/>(Nepal Sarkar)"]

    subgraph SYS["Land Record Management System"]
        direction TB
        login(["Register / Login"])

        c_dash(["View citizen dashboard"])
        c_rec(["View own land records"])
        c_init(["Initiate ownership transfer"])
        c_search(["Search buyer"])
        c_upload(["Upload document"])

        o_dash(["View officer dashboard"])
        o_create(["Create land record"])
        o_bulk(["Bulk import records"])
        o_cit(["List citizens"])
        o_verify(["Verify pending transfer"])
        o_doc(["Verify uploaded document"])

        a_dash(["View admin dashboard"])
        a_approve(["Approve transfer"])
        a_reject(["Reject transfer"])
        a_users(["Manage users"])
        a_create(["Create user"])
        a_toggle(["Activate / Deactivate user"])
        a_audit(["View audit trail"])

        integrity(["Verify record integrity<br/>(Merkle proof)"])
        chain(["Verify hash chain"])
        logout(["Logout"])
    end

    %% Citizen associations
    citizen --- login
    citizen --- c_dash
    citizen --- c_rec
    citizen --- c_init
    citizen --- integrity
    citizen --- chain
    citizen --- logout

    %% Officer associations
    officer --- login
    officer --- o_dash
    officer --- o_create
    officer --- o_bulk
    officer --- o_cit
    officer --- o_verify
    officer --- integrity
    officer --- chain
    officer --- logout

    %% Admin associations
    admin --- login
    admin --- a_dash
    admin --- a_approve
    admin --- a_users
    admin --- a_audit
    admin --- integrity
    admin --- chain
    admin --- logout

    %% include / extend relationships
    c_init -.->|"«include»"| c_search
    c_init -.->|"«extend»"| c_upload
    o_verify -.->|"«extend»"| o_doc
    a_approve -.->|"«extend»"| a_reject
    a_users -.->|"«include»"| a_create
    a_users -.->|"«extend»"| a_toggle

    classDef actorC fill:#f5b7a8,stroke:#a04a3a,stroke-width:2px,color:#1f2937
    classDef actorO fill:#a8c5f5,stroke:#3a5aa0,stroke-width:2px,color:#1f2937
    classDef actorA fill:#c9b8f5,stroke:#5a3aa0,stroke-width:2px,color:#1f2937
    classDef base fill:#e5b3b3,stroke:#a04a4a,stroke-width:1.5px,color:#3b1f1f
    classDef plain fill:#d0d0d0,stroke:#5f5f5f,stroke-width:1.5px,color:#222
    classDef shared fill:#c7ecd4,stroke:#2e8b57,stroke-width:1.5px,color:#14532d
    classDef account fill:#f7d774,stroke:#c79a2b,stroke-width:1.5px,color:#4a3a00

    class citizen actorC
    class officer actorO
    class admin actorA
    class c_init,c_search,c_upload,o_verify,o_doc,a_approve,a_reject,a_users,a_create,a_toggle base
    class c_dash,c_rec,o_dash,o_create,o_bulk,o_cit,a_dash,a_audit plain
    class integrity,chain shared
    class login,logout account
    style SYS fill:#ffffff,stroke:#475569,stroke-width:2px
```
