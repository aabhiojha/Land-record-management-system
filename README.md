# Land Record Management System

A land record digitization web application for Nepal's land administration system. Uses **Merkle Tree** and **Hash Chain** algorithms for tamper-proof record storage and O(log n) verification.

## Tech Stack

- **Backend**: Spring Boot 3.x, Java 21, PostgreSQL, Flyway, JWT
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zustand
- **Algorithm**: SHA-256 Hash Chain + Merkle Tree for immutable record integrity

## Features

- **Three user roles**: Super Admin (Nepal Sarkar), Malpot Officer, Citizen
- **Land record management**: CRUD with automatic SHA-256 hashing
- **Ownership transfer workflow**: Citizen → Officer verification → Admin approval
- **Merkle Tree verification**: Proof generation and visual proof path
- **Hash chain integrity**: Sequential record chain validation
- **Document management**: File upload with SHA-256 integrity hashing
- **Audit logging**: All critical operations are logged
- **OpenAPI documentation**: Swagger UI at `/swagger-ui.html`

## Prerequisites

- Java 21
- Node.js 20+
- PostgreSQL 15+

## Setup

### Database

```bash
createdb land-registry-db
```

### Backend

```bash
cd backend/land-record-management-backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. Flyway runs migrations automatically on startup.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` and proxies API calls to the backend.

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@landrecord.gov.np | admin123 |
| Officer | hari@malpot.gov.np | officer123 |
| Officer | sita@malpot.gov.np | officer123 |
| Citizen | ram@example.com | citizen123 |
| Citizen | gita@example.com | citizen123 |
| Citizen | bikash@example.com | citizen123 |
| Citizen | sunita@example.com | citizen123 |

## API Documentation

After starting the backend, visit `http://localhost:8080/swagger-ui.html` for interactive API docs.

## Tests

```bash
cd backend/land-record-management-backend

# Unit tests (Merkle Tree engine + Hash Chain)
mvn test -Dtest="MerkleTreeEngineTest,HashChainVerifierTest"

# Integration tests (full workflow)
mvn test -Dtest="LandRecordIntegrationTest"

# All tests
mvn test
```

## Demo Flow

1. Login as officer (`hari@malpot.gov.np` / `officer123`)
2. Create a land record with a citizen as owner
3. Login as citizen (`ram@example.com` / `citizen123`)
4. Initiate a transfer to another citizen
5. Login as officer → verify the transfer
6. Login as admin (`admin@landrecord.gov.np` / `admin123`) → approve the transfer
7. Go to Verification page → verify the record's integrity (Merkle proof visualization)
8. Verify the full hash chain
