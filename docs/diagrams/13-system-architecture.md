# System Architecture Diagram

**Report section:** 4.1 System Architecture

A holistic view of the whole system: the three actor roles, the nginx-served
React SPA, the layered Spring Boot backend (security → controllers → services →
repositories), the cryptographic integrity subsystem, and the two backing
stores (PostgreSQL and S3-compatible object storage). Colour key: **yellow**
actors, **grey** web tier, **blue** application layers, **green**
cryptographic/integrity components, **amber** data stores.

```mermaid
%%{init: {'flowchart': {'curve': 'linear', 'nodeSpacing': 45, 'rankSpacing': 60}}}%%
flowchart TB
    subgraph Actors["Actors"]
        citizen(["👤 Citizen"])
        officer(["🧑‍💼 Malpot Officer"])
        admin(["🛡️ Super Admin"])
    end

    subgraph Web["Web tier — nginx container"]
        spa["React 19 SPA<br/>Vite · TS · Tailwind · Zustand<br/>pages · api · stores"]
        proxy["Reverse proxy<br/>/ → static · /api → backend"]
    end

    subgraph Backend["Application — Spring Boot 3 (Java 21)"]
        subgraph SecL["Security layer"]
            jwtf["JwtAuthFilter<br/>JwtTokenProvider"]
            seccfg["SecurityConfig<br/>role-based rules · CORS"]
        end
        subgraph CtrlL["Controllers (REST /api)"]
            ctrl["Auth · LandRecord · Transfer<br/>Verification · Document<br/>User · Dashboard · Audit"]
        end
        subgraph SvcL["Services (business logic)"]
            svc["Auth · RefreshToken · LandRecord<br/>Transfer · Document · Dashboard · Audit · User"]
            integ["LandRecordIntegrityService<br/>hash · rechain · Merkle rebuild"]
        end
        subgraph CryptoL["Integrity engine (merkle package)"]
            merkle["MerkleTreeEngine<br/>SHA-256 · tree · proofs"]
            chain["HashChainVerifier<br/>previousRecordHash links"]
        end
        subgraph DataL["Persistence (Spring Data JPA)"]
            repo["Repositories<br/>User · LandRecord · Transfer · Document<br/>OwnershipHistory · MerkleNode · Audit · RefreshToken"]
            flyway["Flyway migrations"]
        end
    end

    pg[("PostgreSQL<br/>records · users · transfers<br/>ownership history · merkle_nodes<br/>audit_log · refresh_tokens")]
    s3[["S3-compatible object storage<br/>(RustFS) — uploaded documents"]]

    citizen -->|HTTPS/JSON| proxy
    officer -->|HTTPS/JSON| proxy
    admin -->|HTTPS/JSON| proxy
    citizen -.->|static assets| spa
    officer -.-> spa
    admin -.-> spa
    spa --> proxy

    proxy -->|REST + Bearer JWT| jwtf
    jwtf --> seccfg
    seccfg --> ctrl
    ctrl --> svc
    svc --> integ
    integ --> merkle
    integ --> chain
    svc --> repo
    repo --> pg
    flyway --> pg
    svc -->|put / get objects| s3

    classDef actor fill:#fde68a,stroke:#b45309,color:#1c1917
    classDef web fill:#fafafa,stroke:#94a3b8,color:#334155
    classDef app fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef crypto fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef store fill:#fef9c3,stroke:#ca8a04,color:#713f12

    class citizen,officer,admin actor
    class spa,proxy web
    class jwtf,seccfg,ctrl,svc,repo,flyway app
    class merkle,chain,integ crypto
    class pg,s3 store

    style Actors fill:#ffffff,stroke:#94a3b8,stroke-dasharray:4 3
    style Web fill:#ffffff,stroke:#94a3b8,stroke-dasharray:4 3
    style Backend fill:#ffffff,stroke:#3b82f6,stroke-dasharray:4 3
    style SecL fill:#f8fafc,stroke:#64748b,stroke-dasharray:3 2
    style CtrlL fill:#f8fafc,stroke:#64748b,stroke-dasharray:3 2
    style SvcL fill:#f8fafc,stroke:#64748b,stroke-dasharray:3 2
    style CryptoL fill:#f7fef9,stroke:#16a34a,stroke-dasharray:3 2
    style DataL fill:#f8fafc,stroke:#64748b,stroke-dasharray:3 2
```
