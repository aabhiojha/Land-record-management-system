package np.com.abhishekojha.landrecordmanagementbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.RejectRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.TransferRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.TransferResponse;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.service.TransferService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Transfers", description = "Land ownership transfer workflow")
public class TransferController {

    private final TransferService transferService;

    @PostMapping("/api/citizen/transfers")
    @Operation(summary = "Initiate a land transfer (Citizen only)")
    public ResponseEntity<TransferResponse> initiate(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.initiateTransfer(request, user));
    }

    @GetMapping("/api/citizen/transfers")
    @Operation(summary = "Get my transfers (Citizen)")
    public ResponseEntity<Page<TransferResponse>> getMyTransfers(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(transferService.getTransfersByUser(user.getId(), pageable));
    }

    @GetMapping("/api/admin/transfers")
    @Operation(summary = "Get all transfers (Admin)")
    public ResponseEntity<Page<TransferResponse>> getAllTransfers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(transferService.getAllTransfers(pageable));
    }

    @GetMapping("/api/officer/transfers/pending")
    @Operation(summary = "Get transfers pending verification (Officer)")
    public ResponseEntity<List<TransferResponse>> getPendingVerification() {
        return ResponseEntity.ok(transferService.getPendingVerification());
    }

    @PutMapping("/api/officer/transfers/{id}/verify")
    @Operation(summary = "Verify a transfer (Officer)")
    public ResponseEntity<TransferResponse> verify(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.verifyTransfer(id, user));
    }

    @GetMapping("/api/admin/transfers/pending")
    @Operation(summary = "Get transfers pending approval (Admin)")
    public ResponseEntity<List<TransferResponse>> getPendingApproval() {
        return ResponseEntity.ok(transferService.getPendingApproval());
    }

    @PutMapping("/api/admin/transfers/{id}/approve")
    @Operation(summary = "Approve a transfer (Admin)")
    public ResponseEntity<TransferResponse> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.approveTransfer(id, user));
    }

    @PutMapping("/api/admin/transfers/{id}/reject")
    @Operation(summary = "Reject a transfer (Admin)")
    public ResponseEntity<TransferResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.rejectTransfer(id, request.getReason(), user));
    }

    @GetMapping("/api/land-records/{recordId}/transfers")
    @Operation(summary = "Get transfer by ID")
    public ResponseEntity<TransferResponse> getTransfer(@PathVariable Long recordId) {
        return ResponseEntity.ok(transferService.getTransfer(recordId));
    }
}
