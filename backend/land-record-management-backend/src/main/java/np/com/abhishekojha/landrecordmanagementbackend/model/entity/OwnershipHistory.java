package np.com.abhishekojha.landrecordmanagementbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ownership_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_record_id", nullable = false)
    private LandRecord landRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "transfer_id")
    private Long transferId;

    @Column(name = "record_hash")
    private String recordHash;

    @Column(name = "owned_from", nullable = false)
    @Builder.Default
    private LocalDateTime ownedFrom = LocalDateTime.now();

    @Column(name = "owned_until")
    private LocalDateTime ownedUntil;
}
