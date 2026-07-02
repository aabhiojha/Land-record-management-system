# System Flowchart

**Report section:** supplementary (overall program flow)

Top-level flow of the application: authentication, role-based routing, and the
main operations for each role, including the transfer lifecycle and integrity
verification. Colour key: **black** terminals, **yellow** decisions, **blue**
process steps, **green** cryptographic/integrity steps, **red** failure paths.

```mermaid
%%{init: {'themeVariables': {'fontSize': '18px'}, 'flowchart': {'curve': 'linear', 'nodeSpacing': 55, 'rankSpacing': 70}}}%%
flowchart TD
    start([● Start]) --> login[/User enters credentials/]
    login --> auth{Valid credentials?}
    auth -- No --> loginErr[Show login error] --> login
    auth -- Yes --> jwt[Issue JWT + refresh token]
    jwt --> role{Role?}

    %% ---------------- Citizen ----------------
    role -- Citizen --> cDash[View citizen dashboard]
    cDash --> cAct{Choose action}
    cAct -- My records --> cRec[View own land records]
    cAct -- Transfer --> cInit[Search buyer &<br/>initiate transfer]
    cInit --> cValid{Owner & price valid<br/>& no pending?}
    cValid -- No --> cErr[Show error] --> cDash
    cValid -- Yes --> cSave[Create Transfer: INITIATED<br/>compute 5% tax]
    cSave --> pendVerify[(Awaiting officer)]
    cRec --> cDash

    %% ---------------- Officer ----------------
    role -- Officer --> oDash[View officer dashboard]
    oDash --> oAct{Choose action}
    oAct -- New record --> oCreate[Create / bulk import<br/>land record]
    oCreate --> hash[Compute SHA-256 record hash<br/>+ rebuild Merkle tree]
    oAct -- Verify transfer --> oVerify[Verify pending transfer]
    oVerify --> pendApprove[(Awaiting admin)]
    hash --> oDash

    %% ---------------- Admin ----------------
    role -- Admin --> aDash[View admin dashboard]
    aDash --> aAct{Choose action}
    aAct -- Users --> aUsers[Manage users]
    aAct -- Audit --> aAudit[View audit trail]
    aAct -- Decide transfer --> aDecide{Approve or reject?}
    aDecide -- Reject --> aRej[Status → REJECTED]
    aDecide -- Approve --> aApprove[Change owner, rechain hashes,<br/>rebuild Merkle tree]
    aApprove --> done[Status → ADMIN_APPROVED]
    aUsers --> aDash
    aAudit --> aDash

    %% ---------------- Shared verification ----------------
    pendVerify -.-> oVerify
    pendApprove -.-> aDecide
    cDash --> verify[Verify record integrity<br/>Merkle proof + hash chain]
    oDash --> verify
    aDash --> verify
    verify --> vResult{Integrity valid?}
    vResult -- Yes --> vOk[Show valid ✓ + proof path]
    vResult -- No --> vBad[Flag tampered ✗]

    aRej --> logout([⊙ Logout])
    done --> logout
    cErr --> logout
    vOk --> logout
    vBad --> logout

    classDef terminal fill:#1c1917,stroke:#1c1917,color:#ffffff
    classDef decision fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef process fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef crypto fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef failure fill:#fef2f2,stroke:#dc2626,color:#7f1d1d
    classDef wait fill:#f5f5f4,stroke:#78716c,color:#44403c

    class start,logout terminal
    class auth,role,cAct,cValid,oAct,aAct,aDecide,vResult decision
    class login,jwt,cDash,cRec,cInit,cSave,oDash,oCreate,oVerify,aDash,aUsers,aAudit,verify process
    class hash,aApprove,done,vOk crypto
    class loginErr,cErr,aRej,vBad failure
    class pendVerify,pendApprove wait
```
