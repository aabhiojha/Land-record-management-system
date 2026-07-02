# Sequence Diagram — Record Integrity Verification

**Report section:** 3.1.3 Dynamic modelling

Matches `VerificationController → LandRecordIntegrityService.fullVerification`
(single active-record load + one Merkle build).

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
    'actorBkg': '#fde68a', 'actorBorder': '#b45309', 'actorTextColor': '#1c1917',
    'signalColor': '#334155', 'signalTextColor': '#334155',
    'noteBkgColor': '#f0fdf4', 'noteBorderColor': '#16a34a',
    'sequenceNumberColor': '#ffffff'
}}}%%
sequenceDiagram
    autonumber
    actor U as User (any role)
    participant API as VerificationController
    participant IS as IntegrityService
    participant ME as MerkleTreeEngine
    participant DB as PostgreSQL

    U->>API: GET /api/verification/record/{id}
    API->>IS: fullVerification(record)
    IS->>DB: findByIsActiveTrueOrderByIdAsc()
    DB-->>IS: active records (ordered)

    rect rgb(239, 246, 255)
        note over IS: Step 1 — recompute record hash
        IS->>IS: computedHash = computeHash(record)
        IS->>IS: hashValid = computedHash == stored recordHash
    end

    rect rgb(240, 253, 244)
        note over IS,ME: Step 2 — Merkle proof (O(log n))
        IS->>ME: buildTree(leafHashes)
        ME-->>IS: rootHash
        IS->>ME: generateProof(leafIndex, leafHashes)
        ME-->>IS: List<ProofStep> (sibling hashes)
        IS->>ME: verifyProof(recordHash, proof, rootHash)
        ME-->>IS: proofValid
    end

    IS-->>API: RecordVerification{hashValid, proof, root, proofValid}
    API-->>U: VerificationResponse (+ visual proof path)
```
