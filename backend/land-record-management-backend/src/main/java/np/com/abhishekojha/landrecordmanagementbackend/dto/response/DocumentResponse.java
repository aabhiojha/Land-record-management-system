package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private Long id;
    private Long landRecordId;
    private Long transferId;
    private String uploadedByName;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private String documentType;
    private String documentHash;
    private Boolean isVerified;
    private String verifiedByName;
    private LocalDateTime createdAt;
}
