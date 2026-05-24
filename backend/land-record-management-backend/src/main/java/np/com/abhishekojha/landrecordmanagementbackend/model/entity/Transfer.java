package np.com.abhishekojha.landrecordmanagementbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.TransferStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_record_id", nullable = false)
    private LandRecord landRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransferStatus status = TransferStatus.INITIATED;

    @Column(name = "initiated_at", nullable = false)
    @Builder.Default
    private LocalDateTime initiatedAt = LocalDateTime.now();

    @Column(name = "officer_verified_at")
    private LocalDateTime officerVerifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_officer_id")
    private User verifiedByOfficer;

    @Column(name = "admin_approved_at")
    private LocalDateTime adminApprovedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_admin_id")
    private User approvedByAdmin;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "old_record_hash")
    private String oldRecordHash;

    @Column(name = "new_record_hash")
    private String newRecordHash;
}
