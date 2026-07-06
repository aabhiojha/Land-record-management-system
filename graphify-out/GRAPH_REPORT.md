# Graph Report - .  (2026-07-03)

## Corpus Check
- 221 files · ~228,202 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1634 nodes · 3463 edges · 84 communities (77 shown, 7 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 445 edges (avg confidence: 0.81)
- Token cost: 296,352 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Verification Controller & API|Verification Controller & API]]
- [[_COMMUNITY_Merkle Tree Engine|Merkle Tree Engine]]
- [[_COMMUNITY_Use Case Diagram|Use Case Diagram]]
- [[_COMMUNITY_Audit Logging Controller|Audit Logging Controller]]
- [[_COMMUNITY_Dashboard Controller|Dashboard Controller]]
- [[_COMMUNITY_UI Card Components|UI Card Components]]
- [[_COMMUNITY_App & Docker Configuration|App & Docker Configuration]]
- [[_COMMUNITY_Transfer State Lifecycle|Transfer State Lifecycle]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_JWT Auth Filter & Security|JWT Auth Filter & Security]]
- [[_COMMUNITY_Land Record UI Components|Land Record UI Components]]
- [[_COMMUNITY_User Auth Frontend|User Auth Frontend]]
- [[_COMMUNITY_Land Record Request DTO|Land Record Request DTO]]
- [[_COMMUNITY_Exception Types|Exception Types]]
- [[_COMMUNITY_Merkle Node Entity|Merkle Node Entity]]
- [[_COMMUNITY_Transfer Request & Hashing|Transfer Request & Hashing]]
- [[_COMMUNITY_OpenAPI & UI Config|OpenAPI & UI Config]]
- [[_COMMUNITY_User Management Tests|User Management Tests]]
- [[_COMMUNITY_Auth Request DTOs|Auth Request DTOs]]
- [[_COMMUNITY_Land Record Service Logic|Land Record Service Logic]]
- [[_COMMUNITY_Refresh Token Entity|Refresh Token Entity]]
- [[_COMMUNITY_Auth Controller|Auth Controller]]
- [[_COMMUNITY_Transfer Service Logic|Transfer Service Logic]]
- [[_COMMUNITY_Transfer Controller|Transfer Controller]]
- [[_COMMUNITY_User Service & Tests|User Service & Tests]]
- [[_COMMUNITY_Input Group Components|Input Group Components]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_User Response DTO|User Response DTO]]
- [[_COMMUNITY_User Role & Repository|User Role & Repository]]
- [[_COMMUNITY_Land Record Controller|Land Record Controller]]
- [[_COMMUNITY_Document Controller|Document Controller]]
- [[_COMMUNITY_User Controller|User Controller]]
- [[_COMMUNITY_Record Creation & Components Diagram|Record Creation & Components Diagram]]
- [[_COMMUNITY_Unauthorized & Token Tests|Unauthorized & Token Tests]]
- [[_COMMUNITY_Document Entity|Document Entity]]
- [[_COMMUNITY_Document Service|Document Service]]
- [[_COMMUNITY_Document Service Tests|Document Service Tests]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_Global Exception Handler|Global Exception Handler]]
- [[_COMMUNITY_Admin Approval Flowchart|Admin Approval Flowchart]]
- [[_COMMUNITY_Auth Service|Auth Service]]
- [[_COMMUNITY_Land Type & Record Service|Land Type & Record Service]]
- [[_COMMUNITY_Audit API Frontend|Audit API Frontend]]
- [[_COMMUNITY_Merkle Tree Visualization|Merkle Tree Visualization]]
- [[_COMMUNITY_Badge & Audit Formatting|Badge & Audit Formatting]]
- [[_COMMUNITY_Land Record Entity|Land Record Entity]]
- [[_COMMUNITY_Ownership History Entity|Ownership History Entity]]
- [[_COMMUNITY_Transfer Status & Repository|Transfer Status & Repository]]
- [[_COMMUNITY_Land Record Repository|Land Record Repository]]
- [[_COMMUNITY_Alert Dialog Components|Alert Dialog Components]]
- [[_COMMUNITY_Citizen Lookup Controller|Citizen Lookup Controller]]
- [[_COMMUNITY_Transfer Response DTO|Transfer Response DTO]]
- [[_COMMUNITY_Audit Log Entity|Audit Log Entity]]
- [[_COMMUNITY_Ownership History Repository|Ownership History Repository]]
- [[_COMMUNITY_S3 Storage Configuration|S3 Storage Configuration]]
- [[_COMMUNITY_Land Record Response DTO|Land Record Response DTO]]
- [[_COMMUNITY_Application Entry Point|Application Entry Point]]
- [[_COMMUNITY_Ownership History Response|Ownership History Response]]
- [[_COMMUNITY_Login & Routing Flowchart|Login & Routing Flowchart]]
- [[_COMMUNITY_Document Response DTO|Document Response DTO]]
- [[_COMMUNITY_Refresh Token Service|Refresh Token Service]]
- [[_COMMUNITY_Docker Deployment Diagram|Docker Deployment Diagram]]
- [[_COMMUNITY_Auth Response DTO|Auth Response DTO]]
- [[_COMMUNITY_Document Repository|Document Repository]]
- [[_COMMUNITY_Citizen Transfer Flow|Citizen Transfer Flow]]
- [[_COMMUNITY_Record Hash Computation Flow|Record Hash Computation Flow]]
- [[_COMMUNITY_Persistence Architecture Diagram|Persistence Architecture Diagram]]
- [[_COMMUNITY_Tabs Components|Tabs Components]]
- [[_COMMUNITY_User Type Definitions|User Type Definitions]]
- [[_COMMUNITY_Reject Request DTO|Reject Request DTO]]
- [[_COMMUNITY_Context Load Test|Context Load Test]]
- [[_COMMUNITY_Architecture Actors & Web Tier|Architecture Actors & Web Tier]]
- [[_COMMUNITY_Land Record Types|Land Record Types]]
- [[_COMMUNITY_Transfer Types|Transfer Types]]
- [[_COMMUNITY_System Architecture Diagram|System Architecture Diagram]]
- [[_COMMUNITY_App Entry Frontend|App Entry Frontend]]
- [[_COMMUNITY_Document Types|Document Types]]
- [[_COMMUNITY_TypeScript Root Config|TypeScript Root Config]]
- [[_COMMUNITY_Flyway History Table|Flyway History Table]]
- [[_COMMUNITY_App Favicon|App Favicon]]
- [[_COMMUNITY_App Icon Sprite|App Icon Sprite]]
- [[_COMMUNITY_Maven Artifact|Maven Artifact]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 74 edges
2. `UserRepository` - 39 edges
3. `User` - 34 edges
4. `LandRecordRepository` - 34 edges
5. `TransferResponse` - 29 edges
6. `UserResponse` - 28 edges
7. `LandRecordResponse` - 27 edges
8. `ResourceNotFoundException` - 27 edges
9. `LandRecordIntegrityService` - 27 edges
10. `TransferServiceTest` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Super Admin (Nepal Sarkar) Actor` --conceptually_related_to--> `Ownership Transfer Workflow`  [INFERRED]
  docs/diagrams/01-use-case.md → README.md
- `Activity Diagram - End-to-End Transfer` --conceptually_related_to--> `Ownership Transfer Workflow`  [INFERRED]
  docs/diagrams/08-activity-transfer.md → README.md
- `LoadingSpinner()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/common/LoadingSpinner.tsx → frontend/src/lib/utils.ts
- `StatusBadge()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/common/StatusBadge.tsx → frontend/src/lib/utils.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/alert-dialog.tsx → frontend/src/lib/utils.ts

## Import Cycles
- 1-file cycle: `frontend/src/components/ui/button.tsx -> frontend/src/components/ui/button.tsx`
- 1-file cycle: `frontend/src/components/ui/alert-dialog.tsx -> frontend/src/components/ui/alert-dialog.tsx`
- 1-file cycle: `frontend/src/components/ui/dialog.tsx -> frontend/src/components/ui/dialog.tsx`
- 1-file cycle: `frontend/src/components/ui/input.tsx -> frontend/src/components/ui/input.tsx`
- 1-file cycle: `frontend/src/components/ui/popover.tsx -> frontend/src/components/ui/popover.tsx`
- 1-file cycle: `frontend/src/components/ui/select.tsx -> frontend/src/components/ui/select.tsx`
- 1-file cycle: `frontend/src/components/ui/separator.tsx -> frontend/src/components/ui/separator.tsx`
- 1-file cycle: `frontend/src/components/ui/tabs.tsx -> frontend/src/components/ui/tabs.tsx`

## Hyperedges (group relationships)
- **Ownership Transfer Lifecycle Documentation** — docs_diagrams_05_state_transfer_diagram, docs_diagrams_06_sequence_transfer_diagram, docs_diagrams_08_activity_transfer_diagram, docs_diagrams_05_state_transfer_transferstatus_lifecycle, docs_diagrams_03_class_diagram_transferservice, readme_ownership_transfer_workflow [INFERRED 0.85]
- **Cryptographic Integrity Subsystem (SHA-256 + Merkle)** — readme_merkle_tree, readme_hash_chain, docs_diagrams_07_sequence_verification_diagram, docs_diagrams_09_activity_create_record_diagram, docs_diagrams_03_class_diagram_merkletreeengine, docs_diagrams_03_class_diagram_landrecordintegrityservice, docs_diagrams_02_er_diagram_merkle_nodes [INFERRED 0.85]
- **Docker Compose Deployment Stack** — docker_compose_db_service, docker_compose_storage_service, docker_compose_backend_service, docker_compose_frontend_service, docs_diagrams_11_deployment_diagram_diagram [EXTRACTED 1.00]
- **Ownership Transfer Approval Workflow** — docs_diagrams_images_01_use_case_initiate_ownership_transfer, docs_diagrams_images_01_use_case_verify_pending_transfer, docs_diagrams_images_01_use_case_approve_transfer, docs_diagrams_images_01_use_case_reject_transfer, docs_diagrams_images_03_class_diagram_transferstatus [INFERRED 0.85]
- **Merkle Tree Record Integrity Subsystem** — docs_diagrams_images_03_class_diagram_landrecordintegrityservice, docs_diagrams_images_03_class_diagram_merkletreeengine, docs_diagrams_images_03_class_diagram_merklenodeentity, docs_diagrams_images_02__erd_merkle_nodes, docs_diagrams_images_01_use_case_verify_record_integrity [INFERRED 0.85]
- **KIT-045 Ram-to-Gita Transfer Scenario** — docs_diagrams_images_04_object_diagram_rec_landrecord, docs_diagrams_images_04_object_diagram_tr_transfer, docs_diagrams_images_04_object_diagram_ram_user, docs_diagrams_images_04_object_diagram_gita_user, docs_diagrams_images_04_object_diagram_hari_user, docs_diagrams_images_04_object_diagram_admin_user [EXTRACTED 1.00]
- **Three-phase transfer approval workflow (citizen initiates, officer verifies, admin approves)** — docs_diagrams_images_06_sequence_transfer_citizen_seller, docs_diagrams_images_06_sequence_transfer_malpot_officer, docs_diagrams_images_06_sequence_transfer_super_admin, docs_diagrams_images_06_sequence_transfer_transfercontroller, docs_diagrams_images_06_sequence_transfer_transferservice [EXTRACTED 1.00]
- **Admin approval side effects: close ownership, rechain hashes, insert OwnershipHistory, rebuild Merkle tree** — docs_diagrams_images_08_activity_transfer_close_current_ownership, docs_diagrams_images_08_activity_transfer_change_owner_to_buyer, docs_diagrams_images_08_activity_transfer_relink_rehash_chain, docs_diagrams_images_08_activity_transfer_insert_new_ownershiphistory, docs_diagrams_images_08_activity_transfer_rebuild_merkle_tree, docs_diagrams_images_05_state_transfer_admin_approved [EXTRACTED 1.00]
- **Two-step record verification: hash recompute then Merkle proof** — docs_diagrams_images_07_sequence_verification_integrityservice, docs_diagrams_images_07_sequence_verification_merkletreeengine, docs_diagrams_images_07_sequence_verification_recompute_record_hash, docs_diagrams_images_07_sequence_verification_merkle_proof [EXTRACTED 1.00]
- **Hash-chained land record creation flow** — docs_diagrams_images_09_activity_create_record_fetch_previous_record_hash, docs_diagrams_images_09_activity_create_record_canonicalise_timestamp, docs_diagrams_images_09_activity_create_record_compute_record_hash_sha256, docs_diagrams_images_09_activity_create_record_persist_landrecord, docs_diagrams_images_09_activity_create_record_rebuild_merkle_tree, docs_diagrams_images_09_activity_create_record_write_audit_log [EXTRACTED 1.00]
- **Spring Boot 3 layered backend architecture** — docs_diagrams_images_10_component_diagram_security_layer, docs_diagrams_images_10_component_diagram_controllers, docs_diagrams_images_10_component_diagram_services, docs_diagrams_images_10_component_diagram_repositories, docs_diagrams_images_10_component_diagram_merkle_package [EXTRACTED 1.00]
- **Docker Compose three-tier deployment** — docs_diagrams_images_11_deployment_diagram_frontend_container, docs_diagrams_images_11_deployment_diagram_backend_container, docs_diagrams_images_11_deployment_diagram_db_container, docs_diagrams_images_11_deployment_diagram_compose_network [EXTRACTED 1.00]
- **Two-stage Land Transfer Approval Workflow (Citizen -> Officer -> Admin)** — docs_diagrams_images_12_system_flowchart_create_transfer_initiated, docs_diagrams_images_12_system_flowchart_awaiting_officer, docs_diagrams_images_12_system_flowchart_verify_pending_transfer, docs_diagrams_images_12_system_flowchart_awaiting_admin, docs_diagrams_images_12_system_flowchart_approve_or_reject, docs_diagrams_images_12_system_flowchart_status_admin_approved [EXTRACTED 1.00]
- **Record Integrity Engine (hashing, Merkle proofs, hash chain)** — docs_diagrams_images_13_system_architecture_landrecordintegrityservice, docs_diagrams_images_13_system_architecture_merkletreeengine, docs_diagrams_images_13_system_architecture_hashchainverifier, docs_diagrams_images_12_system_flowchart_verify_record_integrity [INFERRED 0.85]
- **Three-tier Architecture (Web tier -> Spring Boot app -> Persistence/Storage)** — docs_diagrams_images_13_system_architecture_react_19_spa, docs_diagrams_images_13_system_architecture_reverse_proxy, docs_diagrams_images_13_system_architecture_spring_boot_application, docs_diagrams_images_13_system_architecture_postgresql, docs_diagrams_images_13_system_architecture_rustfs_object_storage [EXTRACTED 1.00]
- **Merkle Tree Integrity Verification Pattern** — docs_diagrams_images_03_class_diagram_merkletreeengine, docs_diagrams_images_07_sequence_verification_integrityservice, docs_diagrams_images_02_er_diagram_merkle_nodes, docs_diagrams_images_13_system_architecture_integrity_engine, docs_diagrams_images_09_activity_create_record_rebuild_merkle_tree [INFERRED 0.85]
- **Three-Phase Ownership Transfer Workflow (Citizen -> Officer -> Admin)** — docs_diagrams_images_05_state_transfer_diagram, docs_diagrams_images_06_sequence_transfer_diagram, docs_diagrams_images_08_activity_transfer_diagram, docs_diagrams_images_01_use_case_approve_transfer [INFERRED 0.85]

## Communities (84 total, 7 thin omitted)

### Community 0 - "Verification Controller & API"
Cohesion: 0.06
Nodes (48): GetMapping, List, Long, Map, Operation, RequestMapping, RequiredArgsConstructor, ResponseEntity (+40 more)

### Community 1 - "Merkle Tree Engine"
Cohesion: 0.07
Nodes (33): Bean, Configuration, MerkleConfig, AllArgsConstructor, Getter, String, MerkleNode, List (+25 more)

### Community 2 - "Use Case Diagram"
Cohesion: 0.06
Nodes (66): Approve Transfer (Use Case), Bulk Import Records (Use Case), Citizen (Actor), Create Land Record (Use Case), Use Case Diagram, Initiate Ownership Transfer (Use Case), Malpot Officer (Actor), Manage Users - Create/Activate (Use Case) (+58 more)

### Community 3 - "Audit Logging Controller"
Cohesion: 0.06
Nodes (45): AuditController, GetMapping, Operation, Page, RequestMapping, RequiredArgsConstructor, ResponseEntity, RestController (+37 more)

### Community 4 - "Dashboard Controller"
Cohesion: 0.07
Nodes (38): DashboardController, GetMapping, Map, Object, Operation, RequiredArgsConstructor, ResponseEntity, RestController (+30 more)

### Community 5 - "UI Card Components"
Cohesion: 0.07
Nodes (43): SubmitButton(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+35 more)

### Community 6 - "App & Docker Configuration"
Cohesion: 0.07
Nodes (47): Backend Spring Application Config, Flyway Migration Config, JWT Configuration (HMAC-SHA256, 15 min expiry), S3-Compatible Object Storage Config, Test Config (H2 in-memory, PostgreSQL mode), Spring Boot Backend Service (lrms-backend), PostgreSQL Service (lrms-db), Nginx Frontend Service (lrms-frontend) (+39 more)

### Community 7 - "Transfer State Lifecycle"
Cohesion: 0.08
Nodes (42): ADMIN_APPROVED state (terminal, irreversible), CANCELLED state, Transfer State Diagram, INITIATED state, OFFICER_VERIFIED state, REJECTED state, Terminal note: ownership closed, new OwnershipHistory row, chain re-linked, Merkle tree rebuilt (new tree_version), AuditService (+34 more)

### Community 8 - "Frontend Dependencies"
Cohesion: 0.05
Nodes (39): dependencies, axios, @base-ui/react, class-variance-authority, clsx, cmdk, @fontsource-variable/public-sans, lucide-react (+31 more)

### Community 9 - "JWT Auth Filter & Security"
Cohesion: 0.10
Nodes (26): AuthenticationConfiguration, AuthenticationManager, Component, Override, RequiredArgsConstructor, JwtAuthFilter, Component, Long (+18 more)

### Community 10 - "Land Record UI Components"
Cohesion: 0.09
Nodes (16): LocalDateTime, landRecordApi, EmptyStateProps, LoadingSpinner(), PageHeaderProps, PaginationControlsProps, labels, StatusBadge() (+8 more)

### Community 11 - "User Auth Frontend"
Cohesion: 0.12
Nodes (15): LocalDateTime, authApi, ProtectedRoute(), ProtectedRouteProps, SubmitButtonProps, getNavLinks(), MainLayout(), roleLabels (+7 more)

### Community 12 - "Land Record Request DTO"
Cohesion: 0.11
Nodes (21): Double, Getter, Integer, Long, Setter, String, LandRecordRequest, ActiveProfiles (+13 more)

### Community 13 - "Exception Types"
Cohesion: 0.13
Nodes (17): BadRequestException, String, String, ResourceNotFoundException, User, Long, Page, Pageable (+9 more)

### Community 14 - "Merkle Node Entity"
Cohesion: 0.11
Nodes (21): AllArgsConstructor, Boolean, Builder, Entity, Getter, Integer, LandRecord, LocalDateTime (+13 more)

### Community 15 - "Transfer Request & Hashing"
Cohesion: 0.14
Nodes (15): BigDecimal, Getter, Long, Setter, TransferRequest, ActiveProfiles, BeforeEach, Long (+7 more)

### Community 16 - "OpenAPI & UI Config"
Cohesion: 0.08
Nodes (25): Bean, Configuration, OpenApiConfig, aliases, components, hooks, lib, ui (+17 more)

### Community 17 - "User Management Tests"
Cohesion: 0.15
Nodes (17): CreateUserRequest, Getter, Setter, String, ActiveProfiles, AutoConfigureMockMvc, BeforeEach, MockMvc (+9 more)

### Community 18 - "Auth Request DTOs"
Cohesion: 0.14
Nodes (12): Data, String, LoginRequest, Data, String, RegisterRequest, AuthServiceTest, BeforeEach (+4 more)

### Community 19 - "Land Record Service Logic"
Cohesion: 0.21
Nodes (9): LandRecordRequest, Transactional, BeforeEach, ExtendWith, LandRecordRequest, String, Test, User (+1 more)

### Community 20 - "Refresh Token Entity"
Cohesion: 0.10
Nodes (21): AllArgsConstructor, Builder, Entity, Getter, LocalDateTime, Long, NoArgsConstructor, Setter (+13 more)

### Community 21 - "Auth Controller"
Cohesion: 0.16
Nodes (18): ApiResponse, AuthController, AuthResponse, GetMapping, LoginRequest, Operation, PostMapping, RegisterRequest (+10 more)

### Community 22 - "Transfer Service Logic"
Cohesion: 0.20
Nodes (8): TransferRequest, BigDecimal, LandRecord, Long, Test, TransferRequest, User, TransferServiceTest

### Community 23 - "Transfer Controller"
Cohesion: 0.22
Nodes (14): GetMapping, List, Long, Operation, Page, PostMapping, PutMapping, RequiredArgsConstructor (+6 more)

### Community 24 - "User Service & Tests"
Cohesion: 0.18
Nodes (8): Long, Transactional, BeforeEach, ExtendWith, PasswordEncoder, Test, User, UserServiceTest

### Community 25 - "Input Group Components"
Cohesion: 0.11
Nodes (15): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+7 more)

### Community 26 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib, module (+14 more)

### Community 27 - "User Response DTO"
Cohesion: 0.16
Nodes (16): AllArgsConstructor, Boolean, Builder, Data, LocalDateTime, Long, String, UserResponse (+8 more)

### Community 28 - "User Role & Repository"
Cohesion: 0.16
Nodes (15): UserRole, List, Long, Optional, Page, Pageable, String, User (+7 more)

### Community 29 - "Land Record Controller"
Cohesion: 0.21
Nodes (14): GetMapping, LandRecordRequest, List, Long, Operation, Page, PostMapping, RequiredArgsConstructor (+6 more)

### Community 30 - "Document Controller"
Cohesion: 0.19
Nodes (15): DocumentController, GetMapping, List, Long, MultipartFile, Operation, PostMapping, PutMapping (+7 more)

### Community 31 - "User Controller"
Cohesion: 0.17
Nodes (15): Boolean, GetMapping, Long, Map, Operation, Page, PostMapping, PutMapping (+7 more)

### Community 32 - "Record Creation & Components Diagram"
Cohesion: 0.15
Nodes (20): Activity Diagram: Create Land Record, Persist LandRecord, Rebuild Merkle Tree, Write Audit Log, Controllers (Auth, LandRecord, Transfer, Verification, Document, Audit, User, Dashboard), Component Diagram: Land Record Management System, File Storage (uploads volume), Merkle Package (MerkleTreeEngine, HashChainVerifier) (+12 more)

### Community 33 - "Unauthorized & Token Tests"
Cohesion: 0.18
Nodes (7): String, UnauthorizedException, BeforeEach, ExtendWith, Test, User, RefreshTokenServiceTest

### Community 34 - "Document Entity"
Cohesion: 0.11
Nodes (17): Document, AllArgsConstructor, Boolean, Builder, Entity, Getter, LandRecord, LocalDateTime (+9 more)

### Community 35 - "Document Service"
Cohesion: 0.20
Nodes (12): DocumentService, Document, List, Long, MultipartFile, RequiredArgsConstructor, Resource, S3Client (+4 more)

### Community 36 - "Document Service Tests"
Cohesion: 0.20
Nodes (8): DocumentServiceTest, BeforeEach, ExtendWith, LandRecord, MultipartFile, S3Client, Test, User

### Community 37 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 38 - "Global Exception Handler"
Cohesion: 0.37
Nodes (10): GlobalExceptionHandler, Map, Object, ResponseEntity, String, Exception, ExceptionHandler, HttpStatus (+2 more)

### Community 39 - "Admin Approval Flowchart"
Cohesion: 0.13
Nodes (17): Admin Dashboard, Admin Decision: Approve or Reject Transfer, Change Owner, Rechain Hashes, Rebuild Merkle Tree, Compute SHA-256 Record Hash + Rebuild Merkle Tree, Create / Bulk Import Land Record, Flag Tampered, Integrity Valid? Decision, Manage Users (+9 more)

### Community 40 - "Auth Service"
Cohesion: 0.21
Nodes (9): AuthService, AuthResponse, LoginRequest, PasswordEncoder, RegisterRequest, RequiredArgsConstructor, Service, String (+1 more)

### Community 41 - "Land Type & Record Service"
Cohesion: 0.21
Nodes (9): LandType, LandRecord, Long, Page, Pageable, RequiredArgsConstructor, Service, String (+1 more)

### Community 42 - "Audit API Frontend"
Cohesion: 0.20
Nodes (9): auditApi, AuditLog, PageResponse, api, RefreshResponse, dashboardApi, documentApi, transferApi (+1 more)

### Community 43 - "Merkle Tree Visualization"
Cohesion: 0.14
Nodes (9): verificationApi, SceneEdge, SceneNode, SceneText, ChainVerificationResult, MerkleTreeNode, MerkleTreeSnapshot, ProofStep (+1 more)

### Community 44 - "Badge & Audit Formatting"
Cohesion: 0.16
Nodes (6): Badge(), badgeVariants, DashboardPage(), getQuickActions(), getStatCards(), QuickAction

### Community 45 - "Land Record Entity"
Cohesion: 0.13
Nodes (15): AllArgsConstructor, Boolean, Builder, Double, Entity, Getter, Integer, Long (+7 more)

### Community 46 - "Ownership History Entity"
Cohesion: 0.15
Nodes (13): AllArgsConstructor, Builder, Entity, Getter, LandRecord, LocalDateTime, Long, NoArgsConstructor (+5 more)

### Community 47 - "Transfer Status & Repository"
Cohesion: 0.23
Nodes (8): List, Long, Page, Pageable, Transfer, TransferRepository, BeforeEach, ExtendWith

### Community 48 - "Land Record Repository"
Cohesion: 0.35
Nodes (8): LandRecord, List, Long, Optional, Page, Pageable, String, LandRecordRepository

### Community 49 - "Alert Dialog Components"
Cohesion: 0.17
Nodes (9): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+1 more)

### Community 50 - "Citizen Lookup Controller"
Cohesion: 0.32
Nodes (9): CitizenLookupController, GetMapping, Operation, Page, RequiredArgsConstructor, ResponseEntity, RestController, String (+1 more)

### Community 51 - "Transfer Response DTO"
Cohesion: 0.24
Nodes (9): AllArgsConstructor, BigDecimal, Builder, Getter, LocalDateTime, Long, String, TransferResponse (+1 more)

### Community 52 - "Audit Log Entity"
Cohesion: 0.17
Nodes (12): AllArgsConstructor, Boolean, Builder, Entity, Getter, Long, NoArgsConstructor, Setter (+4 more)

### Community 53 - "Ownership History Repository"
Cohesion: 0.32
Nodes (6): List, Long, Optional, OwnershipHistory, OwnershipHistoryRepository, List

### Community 54 - "S3 Storage Configuration"
Cohesion: 0.33
Nodes (8): ApplicationRunner, Bean, Configuration, RequiredArgsConstructor, S3Client, Slf4j, String, StorageConfig

### Community 55 - "Land Record Response DTO"
Cohesion: 0.25
Nodes (10): AllArgsConstructor, Boolean, Builder, Double, Getter, Integer, LocalDateTime, Long (+2 more)

### Community 56 - "Application Entry Point"
Cohesion: 0.20
Nodes (7): String, LandRecordManagementBackendApplication, LandRecordRequest, Long, Override, String, SpringBootApplication

### Community 57 - "Ownership History Response"
Cohesion: 0.29
Nodes (8): AllArgsConstructor, Builder, Getter, LocalDateTime, Long, String, OwnershipHistoryResponse, OwnershipHistory

### Community 58 - "Login & Routing Flowchart"
Cohesion: 0.29
Nodes (10): System Flowchart, Integrity Check (Valid + Proof Path / Flag Tampered), Issue JWT + Refresh Token, Login with JWT + Refresh Token Issuance, Login Flow (credentials validation), Role-based Routing (Citizen / Officer / Admin), Transfer Approval Workflow (Awaiting Officer -> Awaiting Admin -> Approve/Reject), REST Controllers (Auth, LandRecord, Transfer, Verification, Document, User, Dashboard, Audit) (+2 more)

### Community 59 - "Document Response DTO"
Cohesion: 0.33
Nodes (8): DocumentResponse, AllArgsConstructor, Boolean, Builder, Getter, LocalDateTime, Long, String

### Community 60 - "Refresh Token Service"
Cohesion: 0.43
Nodes (5): RequiredArgsConstructor, Service, Transactional, User, RefreshTokenService

### Community 61 - "Docker Deployment Diagram"
Cohesion: 0.39
Nodes (8): backend container (Spring Boot :8080), Compose network (Docker host), db container (PostgreSQL :5432 internal), Deployment Diagram: Docker Compose Topology, Docker Host (Compose Network), frontend container (nginx :80 -> host :8081, serves SPA + proxies /api), Docker volume: pgdata, User Device / Web Browser

### Community 62 - "Auth Response DTO"
Cohesion: 0.43
Nodes (6): AuthResponse, AllArgsConstructor, Builder, Data, Long, String

### Community 63 - "Document Repository"
Cohesion: 0.57
Nodes (4): DocumentRepository, Document, List, Long

### Community 64 - "Citizen Transfer Flow"
Cohesion: 0.29
Nodes (7): Awaiting Admin (transfer state), Awaiting Officer (transfer state), Citizen Dashboard, Create Transfer: INITIATED (compute 5% tax), Search Buyer & Initiate Transfer, Verify Pending Transfer (officer), View Own Land Records

### Community 65 - "Record Hash Computation Flow"
Cohesion: 0.40
Nodes (6): Canonicalise Timestamp (truncate to ms), Compute record_hash = SHA-256(kitta, owner, area, location, type, timestamp, previousHash), Fetch Previous Record Hash (last active record's hash), Officer Submits New Record (start), Return Error, Decision: Valid & Kitta Number Unique?

### Community 66 - "Persistence Architecture Diagram"
Cohesion: 0.33
Nodes (6): Flyway Migrations, Persistence (Spring Data JPA + Flyway Migrations), PostgreSQL (records, users, transfers, ownership history, merkle_nodes, audit_log, refresh_tokens), Spring Data JPA Repositories (User, LandRecord, Transfer, Document, OwnershipHistory, MerkleNode, Audit, RefreshToken), S3-compatible Object Storage (RustFS) for uploaded documents, Service Layer (Auth, RefreshToken, LandRecord, Transfer, Document, Dashboard, Audit, User)

### Community 67 - "Tabs Components"
Cohesion: 0.47
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 68 - "User Type Definitions"
Cohesion: 0.33
Nodes (5): AuthResponse, LoginRequest, RegisterRequest, User, UserRole

### Community 69 - "Reject Request DTO"
Cohesion: 0.60
Nodes (4): Getter, Setter, String, RejectRequest

### Community 70 - "Context Load Test"
Cohesion: 0.60
Nodes (3): SpringBootTest, Test, LandRecordManagementBackendApplicationTests

### Community 71 - "Architecture Actors & Web Tier"
Cohesion: 0.70
Nodes (5): Citizen (actor), Malpot Officer (actor), React 19 SPA (Vite, TS, Tailwind, Zustand), Nginx Reverse Proxy (/ -> static, /api -> backend), Super Admin (actor)

### Community 72 - "Land Record Types"
Cohesion: 0.40
Nodes (4): LandRecord, LandRecordRequest, LandType, OwnershipHistory

### Community 73 - "Transfer Types"
Cohesion: 0.50
Nodes (3): Transfer, TransferRequest, TransferStatus

### Community 74 - "System Architecture Diagram"
Cohesion: 1.00
Nodes (3): Actors (Citizen, Malpot Officer, Super Admin), System Architecture Diagram, Web Tier - nginx Container

## Ambiguous Edges - Review These
- `Citizen (Actor)` → `Verify Hash Chain (Use Case)`  [AMBIGUOUS]
  docs/diagrams/images/01-use-case.png · relation: references
- `Citizen (Actor)` → `Verify Record Integrity - Merkle Proof (Use Case)`  [AMBIGUOUS]
  docs/diagrams/images/01-use-case.png · relation: references

## Knowledge Gaps
- **184 isolated node(s):** `np.com.abhishekojha:land-record-management-backend`, `$schema`, `style`, `rsc`, `tsx` (+179 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Citizen (Actor)` and `Verify Hash Chain (Use Case)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Citizen (Actor)` and `Verify Record Integrity - Merkle Proof (Use Case)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `UserRepository` connect `User Role & Repository` to `Dashboard Controller`, `Auth Service`, `JWT Auth Filter & Security`, `Land Type & Record Service`, `Land Record Request DTO`, `Exception Types`, `Transfer Request & Hashing`, `Transfer Status & Repository`, `User Management Tests`, `Auth Request DTOs`, `Land Record Service Logic`, `Refresh Token Entity`, `Transfer Service Logic`, `User Service & Tests`, `User Response DTO`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `User` connect `Audit Log Entity` to `Audit Logging Controller`, `Dashboard Controller`, `User Auth Frontend`, `Land Record Request DTO`, `Transfer Request & Hashing`, `User Management Tests`, `Auth Request DTOs`, `Land Record Service Logic`, `Refresh Token Entity`, `Auth Controller`, `Transfer Controller`, `User Service & Tests`, `User Response DTO`, `User Role & Repository`, `Land Record Controller`, `Document Controller`, `Unauthorized & Token Tests`, `Document Service`, `Document Service Tests`, `Auth Service`, `Transfer Status & Repository`, `Refresh Token Service`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `ResourceNotFoundException` connect `Exception Types` to `Verification Controller & API`, `Document Service`, `Document Service Tests`, `Global Exception Handler`, `Land Type & Record Service`, `Transfer Status & Repository`, `Land Record Service Logic`, `Ownership History Repository`, `Transfer Service Logic`, `User Service & Tests`, `User Response DTO`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 73 inferred relationships involving `cn()` (e.g. with `LoadingSpinner()` and `StatusBadge()`) actually correct?**
  _`cn()` has 73 INFERRED edges - model-reasoned connections that need verification._
- **What connects `np.com.abhishekojha:land-record-management-backend`, `$schema`, `style` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._