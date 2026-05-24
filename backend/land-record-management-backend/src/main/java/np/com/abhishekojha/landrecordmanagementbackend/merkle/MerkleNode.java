package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MerkleNode {

    private final String hash;
    private final MerkleNode left;
    private final MerkleNode right;
    private final int level;
    private final int position;
    private final boolean isLeaf;

    public static MerkleNode leaf(String hash, int position) {
        return new MerkleNode(hash, null, null, 0, position, true);
    }

    public static MerkleNode internal(String hash, MerkleNode left, MerkleNode right, int level, int position) {
        return new MerkleNode(hash, left, right, level, position, false);
    }
}
