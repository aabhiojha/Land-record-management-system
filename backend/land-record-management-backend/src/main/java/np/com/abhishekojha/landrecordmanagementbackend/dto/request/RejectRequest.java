package np.com.abhishekojha.landrecordmanagementbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
