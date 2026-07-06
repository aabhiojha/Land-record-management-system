package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.AuditLogResponse;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.AuditLog;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Transfer;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.repository.AuditLogRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.TransferRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final LandRecordRepository landRecordRepository;
    private final TransferRepository transferRepository;

    public void log(User user, String action, String entityType, Long entityId, String details) {
        AuditLog entry = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }

    public List<AuditLog> getRecentActivity() {
        return auditLogRepository.findTop20ByOrderByCreatedAtDesc();
    }

    public Page<AuditLog> getAuditLogsPaginated(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public List<AuditLog> getByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    /**
     * Returns a page of audit entries as API responses with human-readable
     * references resolved in place of raw database ids. Targets are batch-loaded
     * (one query per entity type) rather than one lookup per row.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogResponses(Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findAll(pageable);

        Map<Long, LandRecord> recordsById = landRecordRepository
                .findAllById(entityIds(logs, "LandRecord")).stream()
                .collect(Collectors.toMap(LandRecord::getId, Function.identity()));
        Map<Long, Transfer> transfersById = transferRepository
                .findAllById(entityIds(logs, "Transfer")).stream()
                .collect(Collectors.toMap(Transfer::getId, Function.identity()));

        return logs.map(log -> toResponse(log, recordsById, transfersById));
    }

    private List<Long> entityIds(Page<AuditLog> logs, String entityType) {
        return logs.stream()
                .filter(l -> entityType.equals(l.getEntityType()) && l.getEntityId() != null)
                .map(AuditLog::getEntityId)
                .distinct()
                .toList();
    }

    private AuditLogResponse toResponse(AuditLog log,
                                        Map<Long, LandRecord> recordsById,
                                        Map<Long, Transfer> transfersById) {
        User actor = log.getUser();

        String entityLabel = null;
        Long landRecordId = null;

        if ("LandRecord".equals(log.getEntityType())) {
            LandRecord record = recordsById.get(log.getEntityId());
            if (record != null) {
                entityLabel = "Kitta " + record.getKittaNumber();
                landRecordId = record.getId();
            }
        } else if ("Transfer".equals(log.getEntityType())) {
            Transfer transfer = transfersById.get(log.getEntityId());
            if (transfer != null && transfer.getLandRecord() != null) {
                entityLabel = "Kitta " + transfer.getLandRecord().getKittaNumber();
                landRecordId = transfer.getLandRecord().getId();
            }
        }

        return AuditLogResponse.builder()
                .id(log.getId())
                .system(actor == null)
                .userName(actor != null ? actor.getFullName() : null)
                .userEmail(actor != null ? actor.getEmail() : null)
                .userRole(actor != null && actor.getRole() != null ? actor.getRole().name() : null)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityLabel(entityLabel)
                .landRecordId(landRecordId)
                .details(log.getDetails())
                .createdAt(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null)
                .build();
    }
}
