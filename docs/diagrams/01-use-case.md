# Use Case Diagram

**Report section:** 3.1.1 Functional Requirements

Three actors — **Citizen**, **Malpot Officer**, **Super Admin (Nepal Sarkar)** —
in a single system-boundary diagram. Derived from the controller endpoints and
their role restrictions.

```mermaid
flowchart LR
    citizen(["👤 Citizen"])
    officer(["🧑‍💼 Malpot Officer"])
    admin(["🏛️ Super Admin"])

    subgraph SYS["Land Record Management System"]
        UC1(["Register / Login"])
        UC2(["View own land records"])
        UC3(["Search buyer"])
        UC4(["Initiate ownership transfer"])
        UC5(["Upload document"])
        UC6(["Verify record integrity<br/>(Merkle proof)"])
        UC7(["Verify hash chain"])

        UC8(["Create land record"])
        UC9(["Bulk import records"])
        UC10(["Verify pending transfer"])
        UC11(["Verify document"])
        UC12(["View officer dashboard"])

        UC13(["Approve transfer"])
        UC14(["Reject transfer"])
        UC15(["Manage users<br/>(create / activate)"])
        UC16(["View audit trail"])
        UC17(["View admin dashboard"])
    end

    citizen --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7
    officer --- UC1 & UC8 & UC9 & UC10 & UC11 & UC12 & UC6 & UC7
    admin  --- UC1 & UC13 & UC14 & UC15 & UC16 & UC17 & UC6 & UC7

    UC4 -.->|"«include»"| UC3
    UC8 -.->|"«include»"| UC15
    UC13 -.->|"«extend»"| UC14
```
