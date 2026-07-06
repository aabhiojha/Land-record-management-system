package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Full snapshot of the current Merkle tree, level by level, for visualization.
 * {@code levels.get(0)} holds the leaves in record order; the last level holds
 * the single root node.
 */
@Getter
@AllArgsConstructor
@Builder
public class MerkleTreeResponse {

    private String rootHash;
    private int leafCount;
    private int treeHeight;
    private List<List<NodeResponse>> levels;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class NodeResponse {
        private String hash;
        private boolean leaf;
        /** True for the padding copy added when a level has an odd node count. */
        private boolean duplicate;
        private Long recordId;
        private String kittaNumber;
    }
}
