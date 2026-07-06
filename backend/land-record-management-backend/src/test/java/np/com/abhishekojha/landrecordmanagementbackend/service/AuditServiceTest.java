package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.dto.response.AuditLogResponse;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.AuditLog;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.AuditLogRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.TransferRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock private AuditLogRepository auditLogRepository;
    @Mock private LandRecordRepository landRecordRepository;
    @Mock private TransferRepository transferRepository;

    @InjectMocks
    private AuditService auditService;

    @Test
    void log_BuildsAndPersistsEntry() {
        User user = User.builder().id(1L).email("u@example.com").build();

        auditService.log(user, "CREATE_RECORD", "LandRecord", 55L, "created KTM-1");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AuditLog entry = captor.getValue();

        assertEquals(user, entry.getUser());
        assertEquals("CREATE_RECORD", entry.getAction());
        assertEquals("LandRecord", entry.getEntityType());
        assertEquals(55L, entry.getEntityId());
        assertEquals("created KTM-1", entry.getDetails());
    }

    @Test
    void getRecentActivity_DelegatesToRepository() {
        List<AuditLog> logs = List.of(AuditLog.builder().action("X").entityType("Y").build());
        when(auditLogRepository.findTop20ByOrderByCreatedAtDesc()).thenReturn(logs);

        assertSame(logs, auditService.getRecentActivity());
    }

    @Test
    void getAuditLogsPaginated_DelegatesToRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<AuditLog> page = new PageImpl<>(List.of(), pageable, 0);
        when(auditLogRepository.findAll(pageable)).thenReturn(page);

        assertSame(page, auditService.getAuditLogsPaginated(pageable));
    }

    @Test
    void getByEntity_DelegatesToRepository() {
        List<AuditLog> logs = List.of(AuditLog.builder().action("X").entityType("LandRecord").build());
        when(auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("LandRecord", 5L))
                .thenReturn(logs);

        assertSame(logs, auditService.getByEntity("LandRecord", 5L));
    }

    @Test
    void getAuditLogResponses_ResolvesLandRecordLabelAndActor() {
        Pageable pageable = PageRequest.of(0, 10);
        User actor = User.builder().id(1L).fullName("Ram Thapa").email("ram@example.com")
                .role(UserRole.MALPOT_OFFICER).build();
        AuditLog log = AuditLog.builder()
                .id(9L).user(actor).action("CREATE_RECORD")
                .entityType("LandRecord").entityId(55L).details("Created land record KTM-1")
                .build();
        when(auditLogRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(log), pageable, 1));
        when(landRecordRepository.findAllById(List.of(55L)))
                .thenReturn(List.of(LandRecord.builder().id(55L).kittaNumber("KTM-1").build()));
        when(transferRepository.findAllById(List.of())).thenReturn(List.of());

        AuditLogResponse res = auditService.getAuditLogResponses(pageable).getContent().get(0);

        assertFalse(res.isSystem());
        assertEquals("Ram Thapa", res.getUserName());
        assertEquals("MALPOT_OFFICER", res.getUserRole());
        assertEquals("Kitta KTM-1", res.getEntityLabel());
        assertEquals(55L, res.getLandRecordId());
    }

    @Test
    void getAuditLogResponses_MarksEntriesWithoutUserAsSystem() {
        Pageable pageable = PageRequest.of(0, 10);
        AuditLog log = AuditLog.builder()
                .id(3L).user(null).action("REBUILD_TREE").entityType("System").build();
        when(auditLogRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(log), pageable, 1));
        when(landRecordRepository.findAllById(List.of())).thenReturn(List.of());
        when(transferRepository.findAllById(List.of())).thenReturn(List.of());

        AuditLogResponse res = auditService.getAuditLogResponses(pageable).getContent().get(0);

        assertTrue(res.isSystem());
        assertNull(res.getUserName());
        assertNull(res.getEntityLabel());
    }
}
