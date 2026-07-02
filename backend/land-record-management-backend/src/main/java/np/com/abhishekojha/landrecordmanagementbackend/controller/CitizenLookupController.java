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
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "User Lookup", description = "Authenticated user lookups")
public class CitizenLookupController {

    private final UserService userService;

    @GetMapping("/api/citizen/buyer-search")
    @Operation(summary = "Search for a buyer by exact credentials")
    public ResponseEntity<UserResponse> searchBuyer(
            @RequestParam String citizenshipNumber,
            @RequestParam String email) {
        return ResponseEntity.ok(userService.searchBuyer(citizenshipNumber, email));
    }

    @GetMapping("/api/officer/citizens")
    @Operation(summary = "List all citizens (Officer only)")
    public ResponseEntity<Page<UserResponse>> getCitizensForOfficer(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return ResponseEntity.ok(userService.getUsersByRole(UserRole.CITIZEN, pageable));
    }
}
