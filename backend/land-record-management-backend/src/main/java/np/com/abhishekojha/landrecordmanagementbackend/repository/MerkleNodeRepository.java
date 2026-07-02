package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.MerkleNodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MerkleNodeRepository extends JpaRepository<MerkleNodeEntity, Long> {

    List<MerkleNodeEntity> findByTreeVersion(Integer treeVersion);

    @Query("SELECT MAX(m.treeVersion) FROM MerkleNodeEntity m")
    Optional<Integer> findLatestTreeVersion();

    List<MerkleNodeEntity> findByTreeVersionAndIsLeafTrue(Integer treeVersion);

    Optional<MerkleNodeEntity> findByTreeVersionAndLandRecordId(Integer treeVersion, Long landRecordId);

    void deleteByTreeVersion(Integer treeVersion);

    /**
     * Clears the self-referential links (parent/child) of every superseded tree
     * snapshot. Must run before {@link #deleteByTreeVersionLessThan(int)} because
     * some databases (e.g. H2) enforce the self-referential foreign keys row by
     * row, so a bulk delete would otherwise fail on nodes that still point at
     * siblings being removed in the same statement.
     */
    @Modifying
    @Query("UPDATE MerkleNodeEntity m SET m.parent = null, m.leftChild = null, m.rightChild = null "
            + "WHERE m.treeVersion < :version")
    void detachLinksByTreeVersionLessThan(int version);

    /**
     * Bulk-deletes every superseded tree snapshot. Call
     * {@link #detachLinksByTreeVersionLessThan(int)} first.
     */
    @Modifying
    @Query("DELETE FROM MerkleNodeEntity m WHERE m.treeVersion < :version")
    void deleteByTreeVersionLessThan(int version);
}
