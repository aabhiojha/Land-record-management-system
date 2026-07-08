package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.CreateUserRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.UserResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::toResponse);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        if (role == UserRole.CITIZEN
                && (request.getCitizenshipNumber() == null || request.getCitizenshipNumber().isBlank())) {
            throw new BadRequestException("Citizenship number is required for citizen accounts");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .citizenshipNumber(request.getCitizenshipNumber())
                .role(role)
                .district(request.getDistrict())
                .isActive(true)
                .build();

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(active);
        user = userRepository.save(user);
        return toResponse(user);
    }

    public Page<UserResponse> getOfficers(Pageable pageable) {
        return userRepository.findByRole(UserRole.MALPOT_OFFICER, pageable)
                .map(this::toResponse);
    }

    public Page<UserResponse> getUsersByRole(UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable)
                .map(this::toResponse);
    }

    public UserResponse searchBuyer(String citizenshipNumber, String email) {
        User user = userRepository.findByCitizenshipNumberAndEmail(citizenshipNumber, email)
                .orElseThrow(() -> new ResourceNotFoundException("No citizen found with the provided details"));
                
        if (user.getRole() != UserRole.CITIZEN) {
            throw new BadRequestException("User is not a citizen");
        }
        
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .citizenshipNumber(user.getCitizenshipNumber())
                .role(user.getRole().name())
                .district(user.getDistrict())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
