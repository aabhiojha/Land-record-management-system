package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LandRecordRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.LandRecordResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.OwnershipHistory;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.OwnershipHistoryRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LandRecordServiceTest {

    @Mock private LandRecordRepository landRecordRepository;
    @Mock private OwnershipHistoryRepository ownershipHistoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private LandRecordIntegrityService integrityService;
    @Mock private AuditService auditService;

    @InjectMocks
    private LandRecordService landRecordService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(7L)
                .fullName("Sita Citizen")
                .email("sita@example.com")
                .role(UserRole.CITIZEN)
                .build();
    }

    private LandRecordRequest request(String kitta) {
        LandRecordRequest req = new LandRecordRequest();
        req.setKittaNumber(kitta);
        req.setAreaSqMeters(500.0);
        req.setDistrict("Kathmandu");
        req.setMunicipality("KMC");
        req.setWardNumber(10);
        req.setLandType("AABAD");
        req.setOwnerId(owner.getId());
        return req;
    }

    @Test
    void createLandRecord_FirstRecord_HasNullPreviousHashAndRebuildsTree() {
        LandRecordRequest req = request("KTM-1001");

        when(landRecordRepository.existsByKittaNumber("KTM-1001")).thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(landRecordRepository.findByIsActiveTrueOrderByIdAsc()).thenReturn(List.of());
        when(integrityService.computeHash(any(LandRecord.class))).thenReturn("hash-1");
        when(landRecordRepository.save(any(LandRecord.class))).thenAnswer(inv -> {
            LandRecord r = inv.getArgument(0);
            if (r.getId() == null) r.setId(100L);
            return r;
        });

        LandRecordResponse response = landRecordService.createLandRecord(req);

        assertEquals("hash-1", response.getRecordHash());
        assertNull(response.getPreviousRecordHash());
        verify(integrityService).rebuildMerkleTree();
        verify(ownershipHistoryRepository).save(any(OwnershipHistory.class));
        verify(auditService).log(eq(owner), eq("CREATE_RECORD"), eq("LandRecord"), any(), any());
    }

    @Test
    void createLandRecord_SecondRecord_LinksToPreviousHash() {
        LandRecord existing = LandRecord.builder().id(1L).kittaNumber("KTM-1000")
                .recordHash("prev-hash").isActive(true).currentOwner(owner).build();
        LandRecordRequest req = request("KTM-1001");

        when(landRecordRepository.existsByKittaNumber("KTM-1001")).thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(landRecordRepository.findByIsActiveTrueOrderByIdAsc()).thenReturn(List.of(existing));
        when(integrityService.computeHash(any(LandRecord.class))).thenReturn("hash-2");
        when(landRecordRepository.save(any(LandRecord.class))).thenAnswer(inv -> {
            LandRecord r = inv.getArgument(0);
            if (r.getId() == null) r.setId(101L);
            return r;
        });

        LandRecordResponse response = landRecordService.createLandRecord(req);

        assertEquals("prev-hash", response.getPreviousRecordHash());
        assertEquals("hash-2", response.getRecordHash());
    }

    @Test
    void createLandRecord_DuplicateKitta_ThrowsBadRequest() {
        when(landRecordRepository.existsByKittaNumber("KTM-1001")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> landRecordService.createLandRecord(request("KTM-1001")));
        verify(landRecordRepository, never()).save(any());
        verify(integrityService, never()).rebuildMerkleTree();
    }

    @Test
    void createLandRecord_UnknownOwner_ThrowsNotFound() {
        when(landRecordRepository.existsByKittaNumber(any())).thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> landRecordService.createLandRecord(request("KTM-1001")));
    }

    @Test
    void createLandRecord_InvalidLandType_ThrowsBadRequest() {
        LandRecordRequest req = request("KTM-1001");
        req.setLandType("MOON");
        when(landRecordRepository.existsByKittaNumber(any())).thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));

        assertThrows(BadRequestException.class, () -> landRecordService.createLandRecord(req));
    }

    @Test
    void createLandRecordsBulk_RebuildsTreeOnceForAllRecords() {
        when(landRecordRepository.existsByKittaNumber(any())).thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(landRecordRepository.findByIsActiveTrueOrderByIdAsc()).thenReturn(List.of());
        when(integrityService.computeHash(any(LandRecord.class))).thenReturn("h");
        when(landRecordRepository.save(any(LandRecord.class))).thenAnswer(inv -> {
            LandRecord r = inv.getArgument(0);
            if (r.getId() == null) r.setId(200L);
            return r;
        });

        List<LandRecordResponse> responses = landRecordService.createLandRecordsBulk(
                List.of(request("KTM-2001"), request("KTM-2002"), request("KTM-2003")));

        assertEquals(3, responses.size());
        verify(integrityService, times(1)).rebuildMerkleTree();
    }

    @Test
    void getRecord_Unknown_ThrowsNotFound() {
        when(landRecordRepository.findById(42L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> landRecordService.getRecord(42L));
    }

    @Test
    void getOwnershipHistory_UnknownRecord_ThrowsNotFound() {
        when(landRecordRepository.existsById(42L)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> landRecordService.getOwnershipHistory(42L));
        verify(ownershipHistoryRepository, never()).findByLandRecordIdOrderByOwnedFromAsc(any());
    }

    @Test
    void createLandRecord_AuditLogsKittaNumber() {
        LandRecordRequest req = request("KTM-1001");
        when(landRecordRepository.existsByKittaNumber(any())).thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(landRecordRepository.findByIsActiveTrueOrderByIdAsc()).thenReturn(List.of());
        when(integrityService.computeHash(any(LandRecord.class))).thenReturn("hash-1");
        when(landRecordRepository.save(any(LandRecord.class))).thenAnswer(inv -> {
            LandRecord r = inv.getArgument(0);
            if (r.getId() == null) r.setId(100L);
            return r;
        });

        landRecordService.createLandRecord(req);

        ArgumentCaptor<String> details = ArgumentCaptor.forClass(String.class);
        verify(auditService).log(eq(owner), eq("CREATE_RECORD"), eq("LandRecord"), eq(100L), details.capture());
        assertTrue(details.getValue().contains("KTM-1001"));
    }
}
