package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.exception.UnauthorizedException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.RefreshToken;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@example.com").build();
    }

    @Test
    void createRefreshToken_GeneratesUnrevokedFutureToken() {
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(user);

        assertNotNull(token.getToken());
        assertFalse(token.isRevoked());
        assertTrue(token.getExpiryDate().isAfter(LocalDateTime.now()));
        assertEquals(user, token.getUser());
    }

    @Test
    void verifyExpirationAndStatus_ValidToken_ReturnedUnchanged() {
        RefreshToken token = RefreshToken.builder()
                .token("t").user(user).revoked(false)
                .expiryDate(LocalDateTime.now().plusDays(1)).build();

        assertSame(token, refreshTokenService.verifyExpirationAndStatus(token));
    }

    @Test
    void verifyExpirationAndStatus_Revoked_ThrowsUnauthorized() {
        RefreshToken token = RefreshToken.builder()
                .token("t").user(user).revoked(true)
                .expiryDate(LocalDateTime.now().plusDays(1)).build();

        assertThrows(UnauthorizedException.class, () -> refreshTokenService.verifyExpirationAndStatus(token));
    }

    @Test
    void verifyExpirationAndStatus_Expired_DeletesAndThrows() {
        RefreshToken token = RefreshToken.builder()
                .token("t").user(user).revoked(false)
                .expiryDate(LocalDateTime.now().minusMinutes(1)).build();

        assertThrows(UnauthorizedException.class, () -> refreshTokenService.verifyExpirationAndStatus(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void findByToken_Missing_ThrowsUnauthorized() {
        when(refreshTokenRepository.findByToken("nope")).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class, () -> refreshTokenService.findByToken("nope"));
    }

    @Test
    void findByToken_Present_ReturnsToken() {
        RefreshToken token = RefreshToken.builder().token("t").user(user).build();
        when(refreshTokenRepository.findByToken("t")).thenReturn(Optional.of(token));
        assertSame(token, refreshTokenService.findByToken("t"));
    }

    @Test
    void revokeAllUserTokens_MarksEachRevokedAndSaves() {
        RefreshToken t1 = RefreshToken.builder().token("a").user(user).revoked(false).build();
        RefreshToken t2 = RefreshToken.builder().token("b").user(user).revoked(false).build();
        when(refreshTokenRepository.findByUserAndRevokedFalse(user)).thenReturn(List.of(t1, t2));

        refreshTokenService.revokeAllUserTokens(user);

        assertTrue(t1.isRevoked());
        assertTrue(t2.isRevoked());
        ArgumentCaptor<List<RefreshToken>> captor = ArgumentCaptor.forClass(List.class);
        verify(refreshTokenRepository).saveAll(captor.capture());
        assertEquals(2, captor.getValue().size());
    }
}
