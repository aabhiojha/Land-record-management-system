package np.com.abhishekojha.landrecordmanagementbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.LandType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "land_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kitta_number", nullable = false, unique = true)
    private String kittaNumber;

    @Column(name = "area_sq_meters", nullable = false)
    private Double areaSqMeters;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String municipality;

    @Column(name = "ward_number", nullable = false)
    private Integer wardNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "land_type", nullable = false)
    private LandType landType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_owner_id", nullable = false)
    private User currentOwner;

    @Column(name = "record_hash")
    private String recordHash;

    @Column(name = "previous_record_hash")
    private String previousRecordHash;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
