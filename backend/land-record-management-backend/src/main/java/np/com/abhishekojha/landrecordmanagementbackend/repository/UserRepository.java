package np.com.abhishekojha.landrecordmanagementbackend.repository;

import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCitizenshipNumber(String citizenshipNumber);

    List<User> findByRole(UserRole role);

    Optional<User> findByCitizenshipNumber(String citizenshipNumber);
}
