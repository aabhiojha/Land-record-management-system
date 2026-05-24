package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import java.util.List;

public class HashChainVerifier {

    public static boolean verifyChain(List<LandRecordHashInput> records) {
        return findBrokenLink(records) == -1;
    }

    public static int findBrokenLink(List<LandRecordHashInput> records) {
        if (records == null || records.size() < 2) {
            return -1;
        }

        for (int i = 1; i < records.size(); i++) {
            String expectedHash = MerkleTreeEngine.computeRecordHash(records.get(i - 1));
            String actualPrevious = records.get(i).getPreviousOrGenesis();

            if (!expectedHash.equals(actualPrevious)) {
                return i;
            }
        }

        return -1;
    }
}
