package np.com.abhishekojha.landrecordmanagementbackend.system;

import com.fasterxml.jackson.databind.ObjectMapper;
import np.com.abhishekojha.landrecordmanagementbackend.config.JwtTokenProvider;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.CreateUserRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LoginRequest;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.RegisterRequest;
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
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * System tests for admin user management, authenticated lookups and role-scoped
 * dashboards. These drive the full HTTP + security + persistence stack via
 * MockMvc and complement {@link SystemWorkflowE2ETest}, which covers the
 * land-transfer workflow.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserManagementSystemTest {

    private static final String PASSWORD = "password";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private User admin;
    private User officer;
    private User citizen;

    @BeforeEach
    void seedUsers() {
        admin = saveUser("Nepal Sarkar", "admin@um.test", UserRole.SUPER_ADMIN, null);
        officer = saveUser("Hari Officer", "officer@um.test", UserRole.MALPOT_OFFICER, null);
        citizen = saveUser("Sita Citizen", "sita@um.test", UserRole.CITIZEN, "01-01-11111");
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

    // ---- admin creates a user that can then authenticate ------------------

    @Test
    void adminCreatesOfficer_whoCanThenLogin() throws Exception {
        CreateUserRequest create = new CreateUserRequest();
        create.setFullName("New Officer");
        create.setEmail("new-officer@um.test");
        create.setPassword(PASSWORD);
        create.setRole("MALPOT_OFFICER");
        create.setDistrict("Bhaktapur");

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", token(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("MALPOT_OFFICER"))
                .andExpect(jsonPath("$.isActive").value(true));

        LoginRequest login = new LoginRequest();
        login.setEmail("new-officer@um.test");
        login.setPassword(PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("MALPOT_OFFICER"));
    }

    @Test
    void createUser_duplicateEmail_isBadRequest() throws Exception {
        CreateUserRequest create = new CreateUserRequest();
        create.setFullName("Clashing");
        create.setEmail(officer.getEmail()); // already taken
        create.setPassword(PASSWORD);
        create.setRole("CITIZEN");

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", token(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void citizen_cannotCreateUsers() throws Exception {
        CreateUserRequest create = new CreateUserRequest();
        create.setFullName("X");
        create.setEmail("x@um.test");
        create.setPassword(PASSWORD);
        create.setRole("CITIZEN");

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", token(citizen))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isForbidden());
    }

    // ---- deactivation blocks login ----------------------------------------

    @Test
    void adminDeactivatesUser_thenLoginIsRejected() throws Exception {
        mockMvc.perform(put("/api/admin/users/{id}/status", citizen.getId())
                        .header("Authorization", token(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));

        LoginRequest login = new LoginRequest();
        login.setEmail(citizen.getEmail());
        login.setPassword(PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    // ---- validation --------------------------------------------------------

    @Test
    void register_withInvalidEmail_isBadRequest() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Bad Email");
        register.setEmail("not-an-email");
        register.setPassword(PASSWORD);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isBadRequest());
    }

    // ---- authenticated lookups --------------------------------------------

    @Test
    void buyerSearch_exactMatch_returnsCitizen_wrongDetails404() throws Exception {
        mockMvc.perform(get("/api/citizen/buyer-search")
                        .header("Authorization", token(citizen))
                        .param("citizenshipNumber", "01-01-11111")
                        .param("email", "sita@um.test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(citizen.getId()));

        mockMvc.perform(get("/api/citizen/buyer-search")
                        .header("Authorization", token(citizen))
                        .param("citizenshipNumber", "99-99-99999")
                        .param("email", "ghost@um.test"))
                .andExpect(status().isNotFound());
    }

    // ---- role-scoped dashboards -------------------------------------------

    @Test
    void dashboards_areRoleScoped() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", token(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists());

        mockMvc.perform(get("/api/officer/dashboard").header("Authorization", token(officer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingVerifications").exists());

        mockMvc.perform(get("/api/citizen/dashboard").header("Authorization", token(citizen)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.myRecords").exists());

        // A citizen must not reach the admin dashboard.
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", token(citizen)))
                .andExpect(status().isForbidden());
    }

    @Test
    void me_returnsAuthenticatedProfile() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", token(citizen)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(citizen.getEmail()))
                .andExpect(jsonPath("$.role").value("CITIZEN"));
    }
}
