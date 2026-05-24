package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class HashChainVerifierTest {

    private List<LandRecordHashInput> buildValidChain(int size) {
        List<LandRecordHashInput> chain = new ArrayList<>();

        String previousHash = null;
        for (int i = 1; i <= size; i++) {
            LandRecordHashInput record = new LandRecordHashInput(
                    "KTM-" + (1000 + i),
                    i,
                    100.0 * i,
                    "Kathmandu",
                    "KMC",
                    i,
                    "AABAD",
                    "2024-01-0" + i + "T00:00:00",
                    previousHash
            );
            chain.add(record);
            previousHash = MerkleTreeEngine.computeRecordHash(record);
        }

        return chain;
    }

    @Test
    void verifyChain_validChain_returnsTrue() {
        List<LandRecordHashInput> chain = buildValidChain(4);
        assertTrue(HashChainVerifier.verifyChain(chain));
    }

    @Test
    void verifyChain_brokenChain_returnsFalse() {
        List<LandRecordHashInput> chain = buildValidChain(4);

        // Tamper with the middle record's previous hash
        LandRecordHashInput original = chain.get(2);
        LandRecordHashInput tampered = new LandRecordHashInput(
                original.getKittaNumber(),
                original.getOwnerId(),
                original.getAreaSqMeters(),
                original.getDistrict(),
                original.getMunicipality(),
                original.getWardNumber(),
                original.getLandType(),
                original.getTimestamp(),
                "tampered_hash_value"
        );
        chain.set(2, tampered);

        assertFalse(HashChainVerifier.verifyChain(chain));
    }

    @Test
    void findBrokenLink_returnsCorrectIndex() {
        List<LandRecordHashInput> chain = buildValidChain(4);

        // Tamper with record at index 2
        LandRecordHashInput original = chain.get(2);
        LandRecordHashInput tampered = new LandRecordHashInput(
                original.getKittaNumber(),
                original.getOwnerId(),
                original.getAreaSqMeters(),
                original.getDistrict(),
                original.getMunicipality(),
                original.getWardNumber(),
                original.getLandType(),
                original.getTimestamp(),
                "tampered_hash_value"
        );
        chain.set(2, tampered);

        assertEquals(2, HashChainVerifier.findBrokenLink(chain));
    }
}
