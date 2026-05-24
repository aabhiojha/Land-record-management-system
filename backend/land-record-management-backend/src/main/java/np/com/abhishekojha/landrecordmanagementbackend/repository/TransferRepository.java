package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Transfer;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    List<Transfer> findByStatus(TransferStatus status);

    List<Transfer> findBySellerIdOrBuyerId(Long sellerId, Long buyerId);

    List<Transfer> findByLandRecordId(Long landRecordId);

    boolean existsByLandRecordIdAndStatusIn(Long landRecordId, List<TransferStatus> statuses);
}
