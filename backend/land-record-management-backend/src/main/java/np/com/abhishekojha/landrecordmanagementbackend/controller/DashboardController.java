package np.com.abhishekojha.landrecordmanagementbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-specific dashboard stats")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/api/admin/dashboard")
    @Operation(summary = "Admin dashboard stats")
    public ResponseEntity<Map<String, Object>> adminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/api/officer/dashboard")
    @Operation(summary = "Officer dashboard stats")
    public ResponseEntity<Map<String, Object>> officerDashboard() {
        return ResponseEntity.ok(dashboardService.getOfficerDashboard());
    }

    @GetMapping("/api/citizen/dashboard")
    @Operation(summary = "Citizen dashboard stats")
    public ResponseEntity<Map<String, Object>> citizenDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getCitizenDashboard(user.getId()));
    }
}
