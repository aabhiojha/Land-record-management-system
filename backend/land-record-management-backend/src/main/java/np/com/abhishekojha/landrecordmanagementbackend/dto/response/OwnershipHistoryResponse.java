package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class OwnershipHistoryResponse {

    private Long id;
    private Long landRecordId;
    private Long ownerId;
    private String ownerName;
    private Long transferId;
    private String recordHash;
    private LocalDateTime ownedFrom;
    private LocalDateTime ownedUntil;
}
