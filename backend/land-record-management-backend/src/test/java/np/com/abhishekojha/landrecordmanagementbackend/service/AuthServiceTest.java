package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.config.JwtTokenProvider;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LoginRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.RegisterRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.AuthResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.UnauthorizedException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.RefreshToken;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RefreshToken testRefreshToken;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .citizenshipNumber("123456")
                .role(UserRole.CITIZEN)
                .isActive(true)
                .build();

        testRefreshToken = new RefreshToken();
        testRefreshToken.setToken("test-refresh-token");
        testRefreshToken.setUser(testUser);
    }

    @Test
    void register_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password");
        request.setCitizenshipNumber("123456");
        request.setPhone("9800000000");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByCitizenshipNumber(request.getCitizenshipNumber())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(testUser.getId(), testUser.getEmail(), testUser.getRole().name())).thenReturn("test-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(testRefreshToken);

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("test-token", response.getToken());
        assertEquals("test-refresh-token", response.getRefreshToken());
        assertEquals(testUser.getEmail(), response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsBadRequestException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_CitizenshipAlreadyExists_ThrowsBadRequestException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setCitizenshipNumber("123456");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByCitizenshipNumber(request.getCitizenshipNumber())).thenReturn(true);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(testUser.getId(), testUser.getEmail(), testUser.getRole().name())).thenReturn("test-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(testRefreshToken);

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("test-token", response.getToken());
        assertEquals("test-refresh-token", response.getRefreshToken());
    }

    @Test
    void login_InvalidEmail_ThrowsUnauthorizedException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("notfound@example.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void login_InvalidPassword_ThrowsUnauthorizedException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongpassword");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getPassword(), testUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void login_AccountDeactivated_ThrowsUnauthorizedException() {
        // Arrange
        testUser.setIsActive(false);
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getPassword(), testUser.getPasswordHash())).thenReturn(true);

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
