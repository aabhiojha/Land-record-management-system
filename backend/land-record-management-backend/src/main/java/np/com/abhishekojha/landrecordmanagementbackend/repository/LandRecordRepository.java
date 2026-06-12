package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LandRecordRepository extends JpaRepository<LandRecord, Long> {

    Optional<LandRecord> findByKittaNumber(String kittaNumber);

    boolean existsByKittaNumber(String kittaNumber);

    List<LandRecord> findByCurrentOwnerId(Long ownerId);

    List<LandRecord> findByDistrict(String district);

    List<LandRecord> findByIsActiveTrue();

    List<LandRecord> findByIsActiveTrueOrderByIdAsc();

    long countByIsActiveTrue();

    List<LandRecord> findByKittaNumberContainingIgnoreCaseOrDistrictContainingIgnoreCase(String kitta, String district);
}
