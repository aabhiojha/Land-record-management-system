package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.dto.request.TransferRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.TransferResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.OwnershipHistory;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Transfer;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.TransferStatus;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.OwnershipHistoryRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.TransferRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Isolated unit tests for the transfer state machine and its guard rails.
 * All collaborators are mocked so these assert {@link TransferService}'s own
 * validation and status transitions without a database.
 */
@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock private TransferRepository transferRepository;
    @Mock private LandRecordRepository landRecordRepository;
    @Mock private UserRepository userRepository;
    @Mock private OwnershipHistoryRepository ownershipHistoryRepository;
    @Mock private LandRecordIntegrityService integrityService;
    @Mock private AuditService auditService;

    @InjectMocks private TransferService transferService;

    private User seller;
    private User buyer;
    private User officer;
    private User admin;
    private LandRecord record;

    @BeforeEach
    void setUp() {
        seller = User.builder().id(1L).fullName("Seller").email("seller@test.com")
                .role(UserRole.CITIZEN).isActive(true).build();
        buyer = User.builder().id(2L).fullName("Buyer").email("buyer@test.com")
                .role(UserRole.CITIZEN).isActive(true).build();
        officer = User.builder().id(3L).fullName("Officer").email("officer@test.com")
                .role(UserRole.MALPOT_OFFICER).isActive(true).build();
        admin = User.builder().id(4L).fullName("Admin").email("admin@test.com")
                .role(UserRole.SUPER_ADMIN).isActive(true).build();

        record = LandRecord.builder().id(10L).kittaNumber("K-1")
                .currentOwner(seller).recordHash("hash-A").build();
    }

    private TransferRequest request(Long recordId, Long buyerId, BigDecimal price) {
        TransferRequest req = new TransferRequest();
        req.setLandRecordId(recordId);
        req.setBuyerId(buyerId);
        req.setTransactionPrice(price);
        return req;
    }

    // ---- initiate ----------------------------------------------------------

    @Test
    void initiate_success_savesTransferAndComputesFivePercentTax() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(userRepository.findById(2L)).thenReturn(Optional.of(buyer));
        when(transferRepository.existsByLandRecordIdAndStatusIn(eq(10L), any())).thenReturn(false);
        when(transferRepository.save(any(Transfer.class))).thenAnswer(inv -> inv.getArgument(0));

        TransferResponse response = transferService.initiateTransfer(
                request(10L, 2L, new BigDecimal("1000000")), seller);

        assertEquals("INITIATED", response.getStatus());
        assertEquals(0, response.getTaxAmount().compareTo(new BigDecimal("50000.00")));
        assertEquals("hash-A", response.getOldRecordHash());
        verify(transferRepository).save(any(Transfer.class));
        verify(auditService).log(eq(seller), eq("INITIATE_TRANSFER"), eq("Transfer"), any(), any());
    }

    @Test
    void initiate_whenSellerIsNotOwner_throwsBadRequest() {
        record.setCurrentOwner(buyer); // owned by someone else
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));

        assertThrows(BadRequestException.class,
                () -> transferService.initiateTransfer(request(10L, 2L, new BigDecimal("100")), seller));
        verify(transferRepository, never()).save(any());
    }

    @Test
    void initiate_whenRecordMissing_throwsNotFound() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> transferService.initiateTransfer(request(10L, 2L, new BigDecimal("100")), seller));
    }

    @Test
    void initiate_whenBuyerMissing_throwsNotFound() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> transferService.initiateTransfer(request(10L, 2L, new BigDecimal("100")), seller));
    }

    @Test
    void initiate_whenBuyerIsSeller_throwsBadRequest() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(userRepository.findById(1L)).thenReturn(Optional.of(seller));

        assertThrows(BadRequestException.class,
                () -> transferService.initiateTransfer(request(10L, 1L, new BigDecimal("100")), seller));
        verify(transferRepository, never()).save(any());
    }

    @Test
    void initiate_whenPendingTransferExists_throwsBadRequest() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(userRepository.findById(2L)).thenReturn(Optional.of(buyer));
        when(transferRepository.existsByLandRecordIdAndStatusIn(eq(10L), any())).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> transferService.initiateTransfer(request(10L, 2L, new BigDecimal("100")), seller));
        verify(transferRepository, never()).save(any());
    }

    @Test
    void initiate_whenPriceNotPositive_throwsBadRequest() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(userRepository.findById(2L)).thenReturn(Optional.of(buyer));
        when(transferRepository.existsByLandRecordIdAndStatusIn(eq(10L), any())).thenReturn(false);

        assertThrows(BadRequestException.class,
                () -> transferService.initiateTransfer(request(10L, 2L, BigDecimal.ZERO), seller));
        verify(transferRepository, never()).save(any());
    }

    // ---- verify ------------------------------------------------------------

    @Test
    void verify_fromInitiated_movesToOfficerVerified() {
        Transfer transfer = Transfer.builder().id(5L).landRecord(record).seller(seller).buyer(buyer)
                .status(TransferStatus.INITIATED).build();
        when(transferRepository.findById(5L)).thenReturn(Optional.of(transfer));
        when(transferRepository.save(any(Transfer.class))).thenAnswer(inv -> inv.getArgument(0));

        TransferResponse response = transferService.verifyTransfer(5L, officer);

        assertEquals("OFFICER_VERIFIED", response.getStatus());
        assertEquals(officer.getFullName(), response.getVerifiedByOfficerName());
        assertNotNull(transfer.getOfficerVerifiedAt());
    }

    @Test
    void verify_whenNotInitiated_throwsBadRequest() {
        Transfer transfer = Transfer.builder().id(5L).landRecord(record).seller(seller).buyer(buyer)
                .status(TransferStatus.OFFICER_VERIFIED).build();
        when(transferRepository.findById(5L)).thenReturn(Optional.of(transfer));

        assertThrows(BadRequestException.class, () -> transferService.verifyTransfer(5L, officer));
        verify(transferRepository, never()).save(any());
    }

    // ---- approve -----------------------------------------------------------

    @Test
    void approve_fromOfficerVerified_transfersOwnershipAndRebuildsIntegrity() {
        Transfer transfer = Transfer.builder().id(5L).landRecord(record).seller(seller).buyer(buyer)
                .status(TransferStatus.OFFICER_VERIFIED).build();
        when(transferRepository.findById(5L)).thenReturn(Optional.of(transfer));
        when(ownershipHistoryRepository.findByLandRecordIdAndOwnedUntilIsNull(10L))
                .thenReturn(Optional.empty());
        when(landRecordRepository.save(any(LandRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(ownershipHistoryRepository.save(any(OwnershipHistory.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transferRepository.save(any(Transfer.class))).thenAnswer(inv -> inv.getArgument(0));

        TransferResponse response = transferService.approveTransfer(5L, admin);

        assertEquals("ADMIN_APPROVED", response.getStatus());
        assertEquals(buyer.getId(), record.getCurrentOwner().getId());
        assertEquals(admin.getFullName(), response.getApprovedByAdminName());
        // A legitimate mutation must re-link the chain and rebuild the tree.
        verify(integrityService).rechainActiveRecords();
        verify(integrityService).rebuildMerkleTree();
    }

    @Test
    void approve_whenNotOfficerVerified_throwsBadRequest() {
        Transfer transfer = Transfer.builder().id(5L).landRecord(record).seller(seller).buyer(buyer)
                .status(TransferStatus.INITIATED).build();
        when(transferRepository.findById(5L)).thenReturn(Optional.of(transfer));

        assertThrows(BadRequestException.class, () -> transferService.approveTransfer(5L, admin));
        verify(integrityService, never()).rechainActiveRecords();
        verify(landRecordRepository, never()).save(any());
    }

    // ---- reject ------------------------------------------------------------

    @Test
    void reject_fromInitiated_marksRejectedWithReason() {
        Transfer transfer = Transfer.builder().id(5L).landRecord(record).seller(seller).buyer(buyer)
                .status(TransferStatus.INITIATED).build();
        when(transferRepository.findById(5L)).thenReturn(Optional.of(transfer));
        when(transferRepository.save(any(Transfer.class))).thenAnswer(inv -> inv.getArgument(0));

        TransferResponse response = transferService.rejectTransfer(5L, "Fake documents", admin);

        assertEquals("REJECTED", response.getStatus());
        assertEquals("Fake documents", response.getRejectionReason());
    }

    @Test
    void reject_whenAlreadyApproved_throwsBadRequest() {
        Transfer transfer = Transfer.builder().id(5L).landRecord(record).seller(seller).buyer(buyer)
                .status(TransferStatus.ADMIN_APPROVED).build();
        when(transferRepository.findById(5L)).thenReturn(Optional.of(transfer));

        assertThrows(BadRequestException.class,
                () -> transferService.rejectTransfer(5L, "too late", admin));
        verify(transferRepository, never()).save(any());
    }
}
