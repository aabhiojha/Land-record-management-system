package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.dto.request.CreateUserRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.UserResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User citizen;

    @BeforeEach
    void setUp() {
        citizen = User.builder()
                .id(1L)
                .fullName("Sita Citizen")
                .email("sita@example.com")
                .passwordHash("hashed")
                .citizenshipNumber("01-01-11111")
                .role(UserRole.CITIZEN)
                .district("Kathmandu")
                .isActive(true)
                .build();
    }

    private CreateUserRequest officerRequest() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("Hari Officer");
        request.setEmail("hari@example.com");
        request.setPassword("password");
        request.setPhone("9800000000");
        request.setCitizenshipNumber("02-02-22222");
        request.setRole("MALPOT_OFFICER");
        request.setDistrict("Lalitpur");
        return request;
    }

    @Test
    void createUser_Success_encodesPasswordAndPersistsRole() {
        CreateUserRequest request = officerRequest();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("hashed-pw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.createUser(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertEquals("hashed-pw", saved.getPasswordHash());
        assertEquals(UserRole.MALPOT_OFFICER, saved.getRole());
        assertTrue(saved.getIsActive());
        assertEquals("hari@example.com", response.getEmail());
        assertEquals("MALPOT_OFFICER", response.getRole());
    }

    @Test
    void createUser_RoleIsCaseInsensitive() {
        CreateUserRequest request = officerRequest();
        request.setRole("citizen");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed-pw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.createUser(request);

        assertEquals("CITIZEN", response.getRole());
    }

    @Test
    void createUser_DuplicateEmail_ThrowsBadRequest() {
        CreateUserRequest request = officerRequest();
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_InvalidRole_ThrowsBadRequest() {
        CreateUserRequest request = officerRequest();
        request.setRole("KING");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUserStatus_Deactivate_PersistsFlag() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(citizen));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.updateUserStatus(1L, false);

        assertFalse(citizen.getIsActive());
        assertFalse(response.getIsActive());
    }

    @Test
    void updateUserStatus_UnknownUser_ThrowsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.updateUserStatus(99L, true));
        verify(userRepository, never()).save(any());
    }

    @Test
    void searchBuyer_ReturnsCitizen() {
        when(userRepository.findByCitizenshipNumberAndEmail("01-01-11111", "sita@example.com"))
                .thenReturn(Optional.of(citizen));

        UserResponse response = userService.searchBuyer("01-01-11111", "sita@example.com");

        assertEquals(citizen.getId(), response.getId());
    }

    @Test
    void searchBuyer_NoMatch_ThrowsNotFound() {
        when(userRepository.findByCitizenshipNumberAndEmail(any(), any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.searchBuyer("00", "nobody@example.com"));
    }

    @Test
    void searchBuyer_NonCitizen_ThrowsBadRequest() {
        citizen.setRole(UserRole.MALPOT_OFFICER);
        when(userRepository.findByCitizenshipNumberAndEmail(any(), any())).thenReturn(Optional.of(citizen));

        assertThrows(BadRequestException.class,
                () -> userService.searchBuyer("01-01-11111", "sita@example.com"));
    }

    @Test
    void getOfficers_MapsPage() {
        Pageable pageable = PageRequest.of(0, 10);
        User officer = User.builder().id(2L).fullName("Hari").email("hari@example.com")
                .role(UserRole.MALPOT_OFFICER).isActive(true).build();
        Page<User> page = new PageImpl<>(List.of(officer), pageable, 1);
        when(userRepository.findByRole(UserRole.MALPOT_OFFICER, pageable)).thenReturn(page);

        Page<UserResponse> result = userService.getOfficers(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("MALPOT_OFFICER", result.getContent().get(0).getRole());
    }
}
