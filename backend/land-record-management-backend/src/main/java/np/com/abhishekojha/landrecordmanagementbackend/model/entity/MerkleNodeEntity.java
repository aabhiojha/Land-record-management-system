package np.com.abhishekojha.landrecordmanagementbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "merkle_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerkleNodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hash_value", nullable = false)
    private String hashValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "left_child_id")
    private MerkleNodeEntity leftChild;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "right_child_id")
    private MerkleNodeEntity rightChild;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private MerkleNodeEntity parent;

    @Column(name = "node_level", nullable = false)
    private Integer nodeLevel;

    @Column(name = "node_position", nullable = false)
    private Integer nodePosition;

    @Column(name = "is_leaf", nullable = false)
    private Boolean isLeaf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_record_id")
    private LandRecord landRecord;

    @Column(name = "tree_version", nullable = false)
    @Builder.Default
    private Integer treeVersion = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
