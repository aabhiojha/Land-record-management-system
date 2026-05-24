package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class LandRecordResponse {

    private Long id;
    private String kittaNumber;
    private Double areaSqMeters;
    private String district;
    private String municipality;
    private Integer wardNumber;
    private String landType;
    private Long ownerId;
    private String ownerName;
    private String recordHash;
    private String previousRecordHash;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
