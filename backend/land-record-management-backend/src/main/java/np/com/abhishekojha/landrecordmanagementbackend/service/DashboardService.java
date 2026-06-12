package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.TransferStatus;
import np.com.abhishekojha.landrecordmanagementbackend.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LandRecordRepository landRecordRepository;
    private final TransferRepository transferRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecords", landRecordRepository.countByIsActiveTrue());
        stats.put("pendingApprovals", transferRepository.findByStatus(TransferStatus.OFFICER_VERIFIED).size());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransfers", transferRepository.count());
        return stats;
    }

    public Map<String, Object> getOfficerDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecords", landRecordRepository.countByIsActiveTrue());
        stats.put("pendingVerifications", transferRepository.findByStatus(TransferStatus.INITIATED).size());
        stats.put("totalTransfers", transferRepository.count());
        return stats;
    }

    public Map<String, Object> getCitizenDashboard(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("myRecords", landRecordRepository.findByCurrentOwnerId(userId).size());
        stats.put("myTransfers", transferRepository.findBySellerIdOrBuyerId(userId, userId).size());
        return stats;
    }
}
