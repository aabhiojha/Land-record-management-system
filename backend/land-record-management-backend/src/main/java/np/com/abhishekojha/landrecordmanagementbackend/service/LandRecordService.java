package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LandRecordRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.LandRecordResponse;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.OwnershipHistoryResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.OwnershipHistory;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.LandType;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.OwnershipHistoryRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LandRecordService {

    private final LandRecordRepository landRecordRepository;
    private final OwnershipHistoryRepository ownershipHistoryRepository;
    private final UserRepository userRepository;
    private final LandRecordIntegrityService integrityService;
    private final AuditService auditService;

    @Transactional
    public LandRecordResponse createLandRecord(LandRecordRequest request) {
        if (landRecordRepository.existsByKittaNumber(request.getKittaNumber())) {
            throw new BadRequestException("Kitta number already exists: " + request.getKittaNumber());
        }

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getOwnerId()));

        LandType landType;
        try {
            landType = LandType.valueOf(request.getLandType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid land type: " + request.getLandType());
        }

        List<LandRecord> existing = landRecordRepository.findByIsActiveTrue();
        String previousHash = existing.isEmpty() ? null : existing.getLast().getRecordHash();

        LandRecord record = LandRecord.builder()
                .kittaNumber(request.getKittaNumber())
                .areaSqMeters(request.getAreaSqMeters())
                .district(request.getDistrict())
                .municipality(request.getMunicipality())
                .wardNumber(request.getWardNumber())
                .landType(landType)
                .currentOwner(owner)
                .previousRecordHash(previousHash)
                .isActive(true)
                .build();

        record = landRecordRepository.save(record);
        record.setRecordHash(integrityService.computeHash(record));
        record = landRecordRepository.save(record);

        OwnershipHistory history = OwnershipHistory.builder()
                .landRecord(record)
                .owner(owner)
                .recordHash(record.getRecordHash())
                .build();
        ownershipHistoryRepository.save(history);

        integrityService.rebuildMerkleTree();

        auditService.log(owner, "CREATE_RECORD", "LandRecord", record.getId(),
                "Created land record " + record.getKittaNumber());

        return toResponse(record);
    }

    public List<LandRecordResponse> getAllRecords() {
        return landRecordRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public LandRecordResponse getRecord(Long id) {
        LandRecord record = landRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Land record not found: " + id));
        return toResponse(record);
    }

    public List<LandRecordResponse> getRecordsByOwner(Long ownerId) {
        return landRecordRepository.findByCurrentOwnerId(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<LandRecordResponse> searchRecords(String query) {
        return landRecordRepository
                .findByKittaNumberContainingIgnoreCaseOrDistrictContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<OwnershipHistoryResponse> getOwnershipHistory(Long recordId) {
        if (!landRecordRepository.existsById(recordId)) {
            throw new ResourceNotFoundException("Land record not found: " + recordId);
        }

        return ownershipHistoryRepository.findByLandRecordIdOrderByOwnedFromAsc(recordId)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private LandRecordResponse toResponse(LandRecord record) {
        return LandRecordResponse.builder()
                .id(record.getId())
                .kittaNumber(record.getKittaNumber())
                .areaSqMeters(record.getAreaSqMeters())
                .district(record.getDistrict())
                .municipality(record.getMunicipality())
                .wardNumber(record.getWardNumber())
                .landType(record.getLandType().name())
                .ownerId(record.getCurrentOwner().getId())
                .ownerName(record.getCurrentOwner().getFullName())
                .recordHash(record.getRecordHash())
                .previousRecordHash(record.getPreviousRecordHash())
                .isActive(record.getIsActive())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    private OwnershipHistoryResponse toHistoryResponse(OwnershipHistory history) {
        return OwnershipHistoryResponse.builder()
                .id(history.getId())
                .landRecordId(history.getLandRecord().getId())
                .ownerId(history.getOwner().getId())
                .ownerName(history.getOwner().getFullName())
                .transferId(history.getTransferId())
                .recordHash(history.getRecordHash())
                .ownedFrom(history.getOwnedFrom())
                .ownedUntil(history.getOwnedUntil())
                .build();
    }
}
