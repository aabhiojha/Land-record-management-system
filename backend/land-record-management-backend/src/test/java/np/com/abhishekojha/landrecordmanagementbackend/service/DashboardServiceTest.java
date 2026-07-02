package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Transfer;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.TransferStatus;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.TransferRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private LandRecordRepository landRecordRepository;
    @Mock private TransferRepository transferRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void adminDashboard_AggregatesGlobalCounts() {
        when(landRecordRepository.countByIsActiveTrue()).thenReturn(12L);
        when(transferRepository.findByStatus(TransferStatus.OFFICER_VERIFIED))
                .thenReturn(List.of(new Transfer(), new Transfer()));
        when(userRepository.count()).thenReturn(8L);
        when(transferRepository.count()).thenReturn(20L);

        Map<String, Object> stats = dashboardService.getAdminDashboard();

        assertEquals(12L, stats.get("totalRecords"));
        assertEquals(2, stats.get("pendingApprovals"));
        assertEquals(8L, stats.get("totalUsers"));
        assertEquals(20L, stats.get("totalTransfers"));
    }

    @Test
    void officerDashboard_CountsInitiatedTransfersAsPending() {
        when(landRecordRepository.countByIsActiveTrue()).thenReturn(5L);
        when(transferRepository.findByStatus(TransferStatus.INITIATED))
                .thenReturn(List.of(new Transfer()));
        when(transferRepository.count()).thenReturn(9L);

        Map<String, Object> stats = dashboardService.getOfficerDashboard();

        assertEquals(5L, stats.get("totalRecords"));
        assertEquals(1, stats.get("pendingVerifications"));
        assertEquals(9L, stats.get("totalTransfers"));
        assertFalse(stats.containsKey("totalUsers"));
    }

    @Test
    void citizenDashboard_ScopesCountsToUser() {
        when(landRecordRepository.findByCurrentOwnerId(3L))
                .thenReturn(List.of(new LandRecord(), new LandRecord(), new LandRecord()));
        when(transferRepository.findBySellerIdOrBuyerId(3L, 3L))
                .thenReturn(List.of(new Transfer()));

        Map<String, Object> stats = dashboardService.getCitizenDashboard(3L);

        assertEquals(3, stats.get("myRecords"));
        assertEquals(1, stats.get("myTransfers"));
    }
}
