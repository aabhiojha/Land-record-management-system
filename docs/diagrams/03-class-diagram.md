# Class Diagram

**Report section:** 3.1.3 / 4.1 Object modelling

Domain model + service layer (the classes that carry the business logic). DTOs,
repositories, and controllers are summarised rather than enumerated.

```mermaid
classDiagram
    direction LR

    class User {
        +Long id
        +String fullName
        +String email
        +String passwordHash
        +String citizenshipNumber
        +UserRole role
        +String district
        +boolean isActive
    }
    class LandRecord {
        +Long id
        +String kittaNumber
        +double areaSqMeters
        +String district
        +String municipality
        +int wardNumber
        +LandType landType
        +String recordHash
        +String previousRecordHash
        +boolean isActive
    }
    class OwnershipHistory {
        +Long id
        +Long transferId
        +String recordHash
        +LocalDateTime ownedFrom
        +LocalDateTime ownedUntil
    }
    class Transfer {
        +Long id
        +TransferStatus status
        +BigDecimal transactionPrice
        +BigDecimal taxAmount
        +String oldRecordHash
        +String newRecordHash
    }
    class Document {
        +Long id
        +String fileName
        +String filePath
        +DocumentType documentType
        +String documentHash
        +boolean isVerified
    }
    class AuditLog {
        +Long id
        +String action
        +String entityType
        +Long entityId
    }
    class MerkleNodeEntity {
        +Long id
        +String hashValue
        +int nodeLevel
        +int nodePosition
        +boolean isLeaf
        +int treeVersion
    }

    class UserRole {
        <<enumeration>>
        SUPER_ADMIN
        MALPOT_OFFICER
        CITIZEN
    }
    class LandType {
        <<enumeration>>
        AABAD
        KHET
        PAKHO
    }
    class TransferStatus {
        <<enumeration>>
        INITIATED
        OFFICER_VERIFIED
        ADMIN_APPROVED
        REJECTED
        CANCELLED
    }
    class DocumentType {
        <<enumeration>>
        LALPURJA
        NAAPI_NAKSHA
        CITIZENSHIP
        OTHER
    }

    class TransferService {
        +initiateTransfer(req, seller)
        +verifyTransfer(id, officer)
        +approveTransfer(id, admin)
        +rejectTransfer(id, reason, admin)
    }
    class LandRecordService {
        +createRecord(req, officer)
        +getById(id)
        +getHistory(id)
    }
    class LandRecordIntegrityService {
        +computeHash(record) String
        +rechainActiveRecords()
        +rebuildMerkleTree()
        +fullVerification(record) RecordVerification
        +generateProof(record) List~ProofStep~
    }
    class MerkleTreeEngine {
        +sha256(input)$ String
        +computeRecordHash(input)$ String
        +buildTree(leafHashes) MerkleTreeResult
        +generateProof(index, leaves)
        +verifyProof(leaf, proof, root)
    }
    class AuditService {
        +log(user, action, type, id, details)
    }

    User "1" --> "*" LandRecord : currentOwner
    User "1" --> "*" Transfer : seller/buyer
    LandRecord "1" --> "*" OwnershipHistory
    LandRecord "1" --> "*" Transfer
    LandRecord "1" --> "*" Document
    LandRecord "1" --> "*" MerkleNodeEntity : leaf
    Transfer "1" --> "*" OwnershipHistory
    MerkleNodeEntity --> MerkleNodeEntity : parent/child

    User ..> UserRole
    LandRecord ..> LandType
    Transfer ..> TransferStatus
    Document ..> DocumentType

    TransferService ..> LandRecordIntegrityService : uses
    TransferService ..> AuditService : uses
    LandRecordService ..> LandRecordIntegrityService : uses
    LandRecordIntegrityService ..> MerkleTreeEngine : uses
```
