package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class TransferResponse {

    private Long id;
    private Long landRecordId;
    private String kittaNumber;
    private Long sellerId;
    private String sellerName;
    private Long buyerId;
    private String buyerName;
    private String status;
    private LocalDateTime initiatedAt;
    private LocalDateTime officerVerifiedAt;
    private String verifiedByOfficerName;
    private LocalDateTime adminApprovedAt;
    private String approvedByAdminName;
    private String rejectionReason;
    private String oldRecordHash;
    private String newRecordHash;
    private java.math.BigDecimal transactionPrice;
    private java.math.BigDecimal taxAmount;
}
