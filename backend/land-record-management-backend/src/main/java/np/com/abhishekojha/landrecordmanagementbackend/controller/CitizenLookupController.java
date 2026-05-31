package np.com.abhishekojha.landrecordmanagementbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.UserResponse;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "User Lookup", description = "Authenticated user lookups")
public class CitizenLookupController {

    private final UserService userService;

    @GetMapping("/api/users/citizens")
    @Operation(summary = "List all citizens (any authenticated user)")
    public ResponseEntity<List<UserResponse>> getCitizens() {
        return ResponseEntity.ok(userService.getUsersByRole(UserRole.CITIZEN));
    }
}
