package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface LandRecordRepository extends JpaRepository<LandRecord, Long> {

    Optional<LandRecord> findByKittaNumber(String kittaNumber);

    boolean existsByKittaNumber(String kittaNumber);

    List<LandRecord> findByCurrentOwnerId(Long ownerId);
    Page<LandRecord> findByCurrentOwnerId(Long ownerId, Pageable pageable);

    List<LandRecord> findByDistrict(String district);

    List<LandRecord> findByIsActiveTrue();
    Page<LandRecord> findByIsActiveTrue(Pageable pageable);

    List<LandRecord> findByIsActiveTrueOrderByIdAsc();

    long countByIsActiveTrue();

    List<LandRecord> findByKittaNumberContainingIgnoreCaseOrDistrictContainingIgnoreCase(String kitta, String district);
    Page<LandRecord> findByKittaNumberContainingIgnoreCaseOrDistrictContainingIgnoreCase(String kitta, String district, Pageable pageable);
}
