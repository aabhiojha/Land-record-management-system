package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.OwnershipHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OwnershipHistoryRepository extends JpaRepository<OwnershipHistory, Long> {

    List<OwnershipHistory> findByLandRecordIdOrderByOwnedFromAsc(Long landRecordId);

    Optional<OwnershipHistory> findByLandRecordIdAndOwnedUntilIsNull(Long landRecordId);

    List<OwnershipHistory> findByOwnerId(Long ownerId);
}
