package np.com.abhishekojha.landrecordmanagementbackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferRequest {

    @NotNull(message = "Land record ID is required")
    private Long landRecordId;

    @NotNull(message = "Buyer ID is required")
    private Long buyerId;
}
