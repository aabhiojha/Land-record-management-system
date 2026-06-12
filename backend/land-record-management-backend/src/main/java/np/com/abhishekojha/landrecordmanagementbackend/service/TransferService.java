package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.TransferRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.TransferResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.*;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.TransferStatus;
import np.com.abhishekojha.landrecordmanagementbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final LandRecordRepository landRecordRepository;
    private final UserRepository userRepository;
    private final OwnershipHistoryRepository ownershipHistoryRepository;
    private final LandRecordIntegrityService integrityService;
    private final AuditService auditService;

    @Transactional
    public TransferResponse initiateTransfer(TransferRequest request, User seller) {
        LandRecord record = landRecordRepository.findById(request.getLandRecordId())
                .orElseThrow(() -> new ResourceNotFoundException("Land record not found"));

        if (!record.getCurrentOwner().getId().equals(seller.getId())) {
            throw new BadRequestException("You are not the owner of this land record");
        }

        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        if (buyer.getId().equals(seller.getId())) {
            throw new BadRequestException("Cannot transfer to yourself");
        }

        boolean hasPending = transferRepository.existsByLandRecordIdAndStatusIn(
                record.getId(),
                List.of(TransferStatus.INITIATED, TransferStatus.OFFICER_VERIFIED)
        );
        if (hasPending) {
            throw new BadRequestException("This land record already has a pending transfer");
        }

        Transfer transfer = Transfer.builder()
                .landRecord(record)
                .seller(seller)
                .buyer(buyer)
                .oldRecordHash(record.getRecordHash())
                .build();

        transfer = transferRepository.save(transfer);

        auditService.log(seller, "INITIATE_TRANSFER", "Transfer", transfer.getId(),
                "Transfer initiated for " + record.getKittaNumber() + " to " + buyer.getFullName());

        return toResponse(transfer);
    }

    @Transactional
    public TransferResponse verifyTransfer(Long transferId, User officer) {
        Transfer transfer = findTransfer(transferId);

        if (transfer.getStatus() != TransferStatus.INITIATED) {
            throw new BadRequestException("Transfer must be in INITIATED status to verify");
        }

        transfer.setStatus(TransferStatus.OFFICER_VERIFIED);
        transfer.setOfficerVerifiedAt(LocalDateTime.now());
        transfer.setVerifiedByOfficer(officer);

        transfer = transferRepository.save(transfer);

        auditService.log(officer, "VERIFY_TRANSFER", "Transfer", transfer.getId(),
                "Transfer verified for " + transfer.getLandRecord().getKittaNumber());

        return toResponse(transfer);
    }

    @Transactional
    public TransferResponse approveTransfer(Long transferId, User admin) {
        Transfer transfer = findTransfer(transferId);

        if (transfer.getStatus() != TransferStatus.OFFICER_VERIFIED) {
            throw new BadRequestException("Transfer must be OFFICER_VERIFIED to approve");
        }

        LandRecord record = transfer.getLandRecord();
        User newOwner = transfer.getBuyer();

        // Close current ownership
        ownershipHistoryRepository.findByLandRecordIdAndOwnedUntilIsNull(record.getId())
                .ifPresent(h -> {
                    h.setOwnedUntil(LocalDateTime.now());
                    ownershipHistoryRepository.save(h);
                });

        // Update record owner, then re-link the chain. The pre-transfer hash
        // is preserved on transfer.oldRecordHash and in ownership history;
        // previousRecordHash must keep pointing at the preceding record in
        // the chain or chain verification breaks after a legitimate change.
        record.setCurrentOwner(newOwner);
        record = landRecordRepository.save(record);
        integrityService.rechainActiveRecords();
        record = landRecordRepository.findById(record.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Land record not found"));

        // New ownership entry
        OwnershipHistory newHistory = OwnershipHistory.builder()
                .landRecord(record)
                .owner(newOwner)
                .transferId(transfer.getId())
                .recordHash(record.getRecordHash())
                .build();
        ownershipHistoryRepository.save(newHistory);

        // Finalize transfer
        transfer.setStatus(TransferStatus.ADMIN_APPROVED);
        transfer.setAdminApprovedAt(LocalDateTime.now());
        transfer.setApprovedByAdmin(admin);
        transfer.setNewRecordHash(record.getRecordHash());
        transfer = transferRepository.save(transfer);

        integrityService.rebuildMerkleTree();

        auditService.log(admin, "APPROVE_TRANSFER", "Transfer", transfer.getId(),
                "Transfer approved for " + transfer.getLandRecord().getKittaNumber()
                        + ", ownership changed to " + newOwner.getFullName());

        return toResponse(transfer);
    }

    @Transactional
    public TransferResponse rejectTransfer(Long transferId, String reason, User admin) {
        Transfer transfer = findTransfer(transferId);

        if (transfer.getStatus() != TransferStatus.INITIATED
                && transfer.getStatus() != TransferStatus.OFFICER_VERIFIED) {
            throw new BadRequestException("Transfer cannot be rejected in current status");
        }

        transfer.setStatus(TransferStatus.REJECTED);
        transfer.setRejectionReason(reason);
        transfer.setApprovedByAdmin(admin);
        transfer.setAdminApprovedAt(LocalDateTime.now());

        transfer = transferRepository.save(transfer);

        auditService.log(admin, "REJECT_TRANSFER", "Transfer", transfer.getId(),
                "Transfer rejected: " + reason);

        return toResponse(transfer);
    }

    public TransferResponse getTransfer(Long id) {
        return toResponse(findTransfer(id));
    }

    public List<TransferResponse> getTransfersByUser(Long userId) {
        return transferRepository.findBySellerIdOrBuyerId(userId, userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TransferResponse> getPendingVerification() {
        return transferRepository.findByStatus(TransferStatus.INITIATED).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TransferResponse> getPendingApproval() {
        return transferRepository.findByStatus(TransferStatus.OFFICER_VERIFIED).stream()
                .map(this::toResponse)
                .toList();
    }

    private Transfer findTransfer(Long id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));
    }

    private TransferResponse toResponse(Transfer t) {
        return TransferResponse.builder()
                .id(t.getId())
                .landRecordId(t.getLandRecord().getId())
                .kittaNumber(t.getLandRecord().getKittaNumber())
                .sellerId(t.getSeller().getId())
                .sellerName(t.getSeller().getFullName())
                .buyerId(t.getBuyer().getId())
                .buyerName(t.getBuyer().getFullName())
                .status(t.getStatus().name())
                .initiatedAt(t.getInitiatedAt())
                .officerVerifiedAt(t.getOfficerVerifiedAt())
                .verifiedByOfficerName(t.getVerifiedByOfficer() != null ? t.getVerifiedByOfficer().getFullName() : null)
                .adminApprovedAt(t.getAdminApprovedAt())
                .approvedByAdminName(t.getApprovedByAdmin() != null ? t.getApprovedByAdmin().getFullName() : null)
                .rejectionReason(t.getRejectionReason())
                .oldRecordHash(t.getOldRecordHash())
                .newRecordHash(t.getNewRecordHash())
                .build();
    }
}
