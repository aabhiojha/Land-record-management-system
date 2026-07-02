package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.AuditLog;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.repository.AuditLogRepository;
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
}
