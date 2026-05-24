package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.MerkleNodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
