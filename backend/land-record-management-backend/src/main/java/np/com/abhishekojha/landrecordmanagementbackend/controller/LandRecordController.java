package np.com.abhishekojha.landrecordmanagementbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LandRecordRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.LandRecordResponse;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.OwnershipHistoryResponse;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.service.LandRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Land Records", description = "Land record management")
public class LandRecordController {

    private final LandRecordService landRecordService;

    @PostMapping("/api/officer/land-records")
    @Operation(summary = "Create a new land record (Officer only)")
    public ResponseEntity<LandRecordResponse> create(@Valid @RequestBody LandRecordRequest request) {
        return ResponseEntity.ok(landRecordService.createLandRecord(request));
    }

    @GetMapping("/api/land-records")
    @Operation(summary = "List all active land records")
    public ResponseEntity<List<LandRecordResponse>> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(landRecordService.searchRecords(search));
        }
        return ResponseEntity.ok(landRecordService.getAllRecords());
    }

    @GetMapping("/api/land-records/{id}")
    @Operation(summary = "Get land record by ID")
    public ResponseEntity<LandRecordResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(landRecordService.getRecord(id));
    }

    @GetMapping("/api/land-records/{id}/history")
    @Operation(summary = "Get ownership history for a land record")
    public ResponseEntity<List<OwnershipHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(landRecordService.getOwnershipHistory(id));
    }

    @GetMapping("/api/citizen/my-records")
    @Operation(summary = "Get current citizen's land records")
    public ResponseEntity<List<LandRecordResponse>> getMyRecords(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(landRecordService.getRecordsByOwner(user.getId()));
    }

}
