package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MerkleTreeResult {

    private final MerkleNode root;
    private final List<MerkleNode> allNodes;
    private final int leafCount;
    private final int treeHeight;

    public String getRootHash() {
        return root != null ? root.getHash() : null;
    }
}
