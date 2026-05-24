package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class ChainVerificationResponse {

    private boolean valid;
    private int totalRecords;
    private int brokenAtIndex;
    private String message;
}
