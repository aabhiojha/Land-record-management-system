package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LandRecordRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.TransferRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.LandRecordResponse;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.TransferResponse;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.HashChainVerifier;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.LandRecordHashInput;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.ProofStep;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.MerkleNodeRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LandRecordIntegrationTest {

    @Autowired private LandRecordService landRecordService;
    @Autowired private TransferService transferService;
    @Autowired private LandRecordIntegrityService integrityService;
    @Autowired private LandRecordRepository landRecordRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MerkleNodeRepository merkleNodeRepository;
    @Autowired private EntityManager entityManager;

    private User officer;
    private User admin;
    private User citizen1;
    private User citizen2;

    @BeforeEach
    void setUp() {
        admin = userRepository.save(User.builder()
                .fullName("Test Admin").email("admin@test.com")
                .passwordHash("hash").role(UserRole.SUPER_ADMIN).build());
        officer = userRepository.save(User.builder()
                .fullName("Test Officer").email("officer@test.com")
                .passwordHash("hash").role(UserRole.MALPOT_OFFICER).build());
        citizen1 = userRepository.save(User.builder()
                .fullName("Citizen One").email("c1@test.com")
                .passwordHash("hash").citizenshipNumber("01-01-11111").role(UserRole.CITIZEN).build());
        citizen2 = userRepository.save(User.builder()
                .fullName("Citizen Two").email("c2@test.com")
                .passwordHash("hash").citizenshipNumber("01-01-22222").role(UserRole.CITIZEN).build());
    }

    @Test
    void createRecord_computesHashAndBuildsTree() {
        LandRecordResponse record = createRecord("KTM-1001", citizen1.getId());

        assertNotNull(record.getRecordHash());
        assertEquals(64, record.getRecordHash().length());
        assertNull(record.getPreviousRecordHash());

        String rootHash = integrityService.getCurrentMerkleRoot();
        assertNotNull(rootHash);
        assertEquals(record.getRecordHash(), rootHash);
    }

    @Test
    void multipleRecords_formHashChain() {
        createRecord("KTM-1001", citizen1.getId());
        LandRecordResponse second = createRecord("KTM-1002", citizen2.getId());

        assertNotNull(second.getPreviousRecordHash());

        List<LandRecordHashInput> chain = integrityService.buildChainInputs();
        assertTrue(HashChainVerifier.verifyChain(chain));
    }

    @Test
    void fullTransferWorkflow_updatesOwnerAndHash() {
        LandRecordResponse record = createRecord("KTM-1001", citizen1.getId());
        String originalHash = record.getRecordHash();

        TransferRequest transferReq = new TransferRequest();
        transferReq.setLandRecordId(record.getId());
        transferReq.setBuyerId(citizen2.getId());
        transferReq.setTransactionPrice(new java.math.BigDecimal("1000000"));
        TransferResponse transfer = transferService.initiateTransfer(transferReq, citizen1);
        assertEquals("INITIATED", transfer.getStatus());

        transfer = transferService.verifyTransfer(transfer.getId(), officer);
        assertEquals("OFFICER_VERIFIED", transfer.getStatus());

        transfer = transferService.approveTransfer(transfer.getId(), admin);
        assertEquals("ADMIN_APPROVED", transfer.getStatus());
        assertNotNull(transfer.getNewRecordHash());
        assertNotEquals(originalHash, transfer.getNewRecordHash());

        LandRecordResponse updated = landRecordService.getRecord(record.getId());
        assertEquals(citizen2.getId(), updated.getOwnerId());

        var history = landRecordService.getOwnershipHistory(record.getId());
        assertEquals(2, history.size());
    }

    @Test
    void transferMiddleRecord_keepsChainAndHashesValid() {
        createRecord("KTM-1001", citizen1.getId());
        LandRecordResponse middle = createRecord("KTM-1002", citizen1.getId());
        createRecord("KTM-1003", citizen2.getId());

        TransferRequest transferReq = new TransferRequest();
        transferReq.setLandRecordId(middle.getId());
        transferReq.setBuyerId(citizen2.getId());
        transferReq.setTransactionPrice(new java.math.BigDecimal("1000000"));
        TransferResponse transfer = transferService.initiateTransfer(transferReq, citizen1);
        transfer = transferService.verifyTransfer(transfer.getId(), officer);
        transferService.approveTransfer(transfer.getId(), admin);

        List<LandRecordHashInput> chain = integrityService.buildChainInputs();
        assertEquals(-1, HashChainVerifier.findBrokenLink(chain));
        assertTrue(HashChainVerifier.verifyChain(chain));

        for (LandRecord record : landRecordRepository.findByIsActiveTrueOrderByIdAsc()) {
            assertTrue(integrityService.verifyRecordHash(record),
                    "Stored hash should match recomputed hash for " + record.getKittaNumber());
        }
    }

    @Test
    void rejectTransfer_doesNotChangeOwner() {
        LandRecordResponse record = createRecord("KTM-1001", citizen1.getId());

        TransferRequest transferReq = new TransferRequest();
        transferReq.setLandRecordId(record.getId());
        transferReq.setBuyerId(citizen2.getId());
        transferReq.setTransactionPrice(new java.math.BigDecimal("1000000"));
        TransferResponse transfer = transferService.initiateTransfer(transferReq, citizen1);

        transfer = transferService.rejectTransfer(transfer.getId(), "Missing documents", admin);
        assertEquals("REJECTED", transfer.getStatus());

        LandRecordResponse unchanged = landRecordService.getRecord(record.getId());
        assertEquals(citizen1.getId(), unchanged.getOwnerId());
    }

    @Test
    void verifyRecord_hashAndProof() {
        LandRecordResponse response = createRecord("KTM-1001", citizen1.getId());

        LandRecord record = landRecordRepository.findById(response.getId()).orElseThrow();
        assertTrue(integrityService.verifyRecordHash(record));

        List<ProofStep> proof = integrityService.generateProof(record);
        assertNotNull(proof);

        assertTrue(integrityService.verifyProof(record));
    }

    @Test
    void recordHash_survivesPersistenceRoundTrip() {
        LandRecordResponse response = createRecord("KTM-1001", citizen1.getId());

        // Force the entity out of the first-level cache so it is re-read from
        // the database, picking up whatever timestamp precision the store keeps.
        entityManager.flush();
        entityManager.clear();

        LandRecord reloaded = landRecordRepository.findById(response.getId()).orElseThrow();
        assertTrue(integrityService.verifyRecordHash(reloaded),
                "Stored hash must still match after the record is reloaded from the DB");
    }

    @Test
    void rebuildMerkleTree_prunesSupersededVersions() {
        createRecord("KTM-1001", citizen1.getId());
        createRecord("KTM-1002", citizen2.getId());
        createRecord("KTM-1003", citizen1.getId());

        // Three creates each rebuild the tree, but only the newest snapshot
        // should remain persisted.
        Integer latest = merkleNodeRepository.findLatestTreeVersion().orElseThrow();
        long stale = merkleNodeRepository.findAll().stream()
                .filter(n -> !n.getTreeVersion().equals(latest))
                .count();
        assertEquals(0, stale, "Superseded Merkle tree versions must be pruned");
    }

    private LandRecordResponse createRecord(String kitta, Long ownerId) {
        LandRecordRequest req = new LandRecordRequest();
        req.setKittaNumber(kitta);
        req.setAreaSqMeters(500.0);
        req.setDistrict("Kathmandu");
        req.setMunicipality("KMC");
        req.setWardNumber(10);
        req.setLandType("AABAD");
        req.setOwnerId(ownerId);
        return landRecordService.createLandRecord(req);
    }
}
