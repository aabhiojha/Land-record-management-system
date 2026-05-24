package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

class MerkleTreeEngineTest {

    private MerkleTreeEngine engine;

    @BeforeEach
    void setUp() {
        engine = new MerkleTreeEngine();
    }

    @Test
    void sha256_producesConsistentHash() {
        String hash1 = MerkleTreeEngine.sha256("hello");
        String hash2 = MerkleTreeEngine.sha256("hello");
        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length());
    }

    @Test
    void sha256_differentInputs_differentHashes() {
        String hash1 = MerkleTreeEngine.sha256("hello");
        String hash2 = MerkleTreeEngine.sha256("world");
        assertNotEquals(hash1, hash2);
    }

    @Test
    void computeRecordHash_includesPreviousHash() {
        LandRecordHashInput input1 = new LandRecordHashInput(
                "KTM-1001", 1, 500.0, "Kathmandu", "KMC", 10, "AABAD",
                "2024-01-01T00:00:00", null
        );
        LandRecordHashInput input2 = new LandRecordHashInput(
                "KTM-1001", 1, 500.0, "Kathmandu", "KMC", 10, "AABAD",
                "2024-01-01T00:00:00", "abc123"
        );

        String hash1 = MerkleTreeEngine.computeRecordHash(input1);
        String hash2 = MerkleTreeEngine.computeRecordHash(input2);

        assertNotEquals(hash1, hash2);
    }

    @Test
    void buildTree_singleLeaf() {
        String leafHash = MerkleTreeEngine.sha256("record1");
        MerkleTreeResult result = engine.buildTree(List.of(leafHash));

        assertEquals(leafHash, result.getRootHash());
        assertEquals(1, result.getLeafCount());
        assertEquals(1, result.getTreeHeight());
    }

    @Test
    void buildTree_twoLeaves() {
        String h1 = MerkleTreeEngine.sha256("record1");
        String h2 = MerkleTreeEngine.sha256("record2");

        MerkleTreeResult result = engine.buildTree(List.of(h1, h2));

        String expectedRoot = MerkleTreeEngine.sha256(h1 + h2);
        assertEquals(expectedRoot, result.getRootHash());
        assertEquals(2, result.getLeafCount());
    }

    @Test
    void buildTree_fourLeaves() {
        List<String> hashes = IntStream.rangeClosed(1, 4)
                .mapToObj(i -> MerkleTreeEngine.sha256("record" + i))
                .toList();

        MerkleTreeResult result = engine.buildTree(hashes);

        String h01 = MerkleTreeEngine.sha256(hashes.get(0) + hashes.get(1));
        String h23 = MerkleTreeEngine.sha256(hashes.get(2) + hashes.get(3));
        String expectedRoot = MerkleTreeEngine.sha256(h01 + h23);

        assertEquals(expectedRoot, result.getRootHash());
        assertEquals(4, result.getLeafCount());
        assertEquals(3, result.getTreeHeight());
    }

    @Test
    void buildTree_oddLeaves_duplicatesLast() {
        List<String> hashes = IntStream.rangeClosed(1, 7)
                .mapToObj(i -> MerkleTreeEngine.sha256("record" + i))
                .toList();

        MerkleTreeResult result = engine.buildTree(hashes);

        assertNotNull(result.getRootHash());
        assertEquals(7, result.getLeafCount());
        // 7 leaves → 8 (dup last) → 4 → 2 → 1 root, height = 4
        assertEquals(4, result.getTreeHeight());
    }

    @Test
    void generateAndVerifyProof_valid() {
        List<String> hashes = IntStream.rangeClosed(1, 8)
                .mapToObj(i -> MerkleTreeEngine.sha256("record" + i))
                .toList();

        MerkleTreeResult tree = engine.buildTree(hashes);

        for (int i = 0; i < hashes.size(); i++) {
            List<ProofStep> proof = engine.generateProof(i, hashes);
            assertTrue(
                    engine.verifyProof(hashes.get(i), proof, tree.getRootHash()),
                    "Proof failed for leaf index " + i
            );
        }
    }

    @Test
    void verifyProof_tamperedLeaf_fails() {
        List<String> hashes = IntStream.rangeClosed(1, 4)
                .mapToObj(i -> MerkleTreeEngine.sha256("record" + i))
                .toList();

        MerkleTreeResult tree = engine.buildTree(hashes);
        List<ProofStep> proof = engine.generateProof(0, hashes);

        String tampered = MerkleTreeEngine.sha256("TAMPERED");
        assertFalse(engine.verifyProof(tampered, proof, tree.getRootHash()));
    }

    @Test
    void buildTree_fifteenLeaves() {
        List<String> hashes = IntStream.rangeClosed(1, 15)
                .mapToObj(i -> MerkleTreeEngine.sha256("record" + i))
                .toList();

        MerkleTreeResult result = engine.buildTree(hashes);

        assertNotNull(result.getRootHash());
        assertEquals(15, result.getLeafCount());
        // 15 → 16 → 8 → 4 → 2 → 1, height = 5
        assertEquals(5, result.getTreeHeight());

        // Verify proof works for every leaf in a large tree
        for (int i = 0; i < hashes.size(); i++) {
            List<ProofStep> proof = engine.generateProof(i, hashes);
            assertTrue(engine.verifyProof(hashes.get(i), proof, result.getRootHash()));
        }
    }
}
