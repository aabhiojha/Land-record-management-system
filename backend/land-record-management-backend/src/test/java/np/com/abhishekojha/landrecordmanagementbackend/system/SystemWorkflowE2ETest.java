package np.com.abhishekojha.landrecordmanagementbackend.system;

import com.fasterxml.jackson.databind.ObjectMapper;
import np.com.abhishekojha.landrecordmanagementbackend.config.JwtTokenProvider;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LandRecordRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LoginRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.RegisterRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.TransferRequest;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end system tests that drive the application through real HTTP requests
 * (via MockMvc) and the full Spring Security filter chain, controllers, services
 * and an in-memory database. These assert authentication, role-based access
 * control, and the complete land-transfer workflow as a black box.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SystemWorkflowE2ETest {

    private static final String PASSWORD = "password";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private User admin;
    private User officer;
    private User citizen1;
    private User citizen2;

    @BeforeEach
    void seedUsers() {
        admin = saveUser("Nepal Sarkar", "admin@sys.test", UserRole.SUPER_ADMIN, null);
        officer = saveUser("Hari Officer", "officer@sys.test", UserRole.MALPOT_OFFICER, null);
        citizen1 = saveUser("Sita Citizen", "sita@sys.test", UserRole.CITIZEN, "01-01-11111");
        citizen2 = saveUser("Ram Citizen", "ram@sys.test", UserRole.CITIZEN, "01-01-22222");
    }

    private User saveUser(String name, String email, UserRole role, String citizenship) {
        return userRepository.save(User.builder()
                .fullName(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .citizenshipNumber(citizenship)
                .role(role)
                .isActive(true)
                .build());
    }

    private String token(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    // ---- authentication ----------------------------------------------------

    @Test
    void register_thenLogin_returnsJwt() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setFullName("New Citizen");
        register.setEmail("new@sys.test");
        register.setPassword(PASSWORD);
        register.setCitizenshipNumber("02-02-33333");
        register.setPhone("9800000000");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CITIZEN"));

        LoginRequest login = new LoginRequest();
        login.setEmail("new@sys.test");
        login.setPassword(PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void login_withWrongPassword_isUnauthorized() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail(citizen1.getEmail());
        login.setPassword("wrong-password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    // ---- access control ----------------------------------------------------

    @Test
    void protectedEndpoint_withoutToken_isRejected() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void adminEndpoint_forbidsCitizen_allowsAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/users").header("Authorization", token(citizen1)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users").header("Authorization", token(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void landRecordListing_forbidsCitizen_allowsOfficer() throws Exception {
        mockMvc.perform(get("/api/land-records").header("Authorization", token(citizen1)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/land-records").header("Authorization", token(officer)))
                .andExpect(status().isOk());
    }

    // ---- full workflow -----------------------------------------------------

    @Test
    void transferWorkflow_initiateVerifyApprove_changesOwnerAndStaysVerifiable() throws Exception {
        // 1. Admin registers a new land record owned by citizen1.
        LandRecordRequest recordReq = new LandRecordRequest();
        recordReq.setKittaNumber("SYS-9001");
        recordReq.setAreaSqMeters(650.0);
        recordReq.setDistrict("Kathmandu");
        recordReq.setMunicipality("KMC");
        recordReq.setWardNumber(5);
        recordReq.setLandType("AABAD");
        recordReq.setOwnerId(citizen1.getId());

        MvcResult created = mockMvc.perform(post("/api/admin/land-records")
                        .header("Authorization", token(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recordReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recordHash").isNotEmpty())
                .andReturn();
        long recordId = jsonLong(created, "id");

        // 2. Citizen1 (owner) initiates a transfer to citizen2.
        TransferRequest transferReq = new TransferRequest();
        transferReq.setLandRecordId(recordId);
        transferReq.setBuyerId(citizen2.getId());
        transferReq.setTransactionPrice(new BigDecimal("2000000"));

        MvcResult initiated = mockMvc.perform(post("/api/citizen/transfers")
                        .header("Authorization", token(citizen1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INITIATED"))
                .andReturn();
        long transferId = jsonLong(initiated, "id");

        // 3. Officer verifies it.
        mockMvc.perform(put("/api/officer/transfers/{id}/verify", transferId)
                        .header("Authorization", token(officer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OFFICER_VERIFIED"));

        // 4. Admin approves it.
        mockMvc.perform(put("/api/admin/transfers/{id}/approve", transferId)
                        .header("Authorization", token(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ADMIN_APPROVED"))
                .andExpect(jsonPath("$.newRecordHash").isNotEmpty());

        // 5. Ownership has moved to citizen2.
        mockMvc.perform(get("/api/land-records/{id}", recordId)
                        .header("Authorization", token(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").value(citizen2.getId()));

        // 6. The record still passes integrity verification after the transfer.
        mockMvc.perform(get("/api/verification/record/{id}", recordId)
                        .header("Authorization", token(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
    }

    @Test
    void citizen_cannotVerifyTransfer_officerOnly() throws Exception {
        mockMvc.perform(put("/api/officer/transfers/{id}/verify", 999)
                        .header("Authorization", token(citizen1)))
                .andExpect(status().isForbidden());
    }

    private long jsonLong(MvcResult result, String field) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString()).get(field).asLong();
    }
}
