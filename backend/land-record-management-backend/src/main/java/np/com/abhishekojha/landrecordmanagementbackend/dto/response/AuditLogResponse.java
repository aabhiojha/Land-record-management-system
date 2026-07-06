package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogResponse {
    private Long id;

    // Who performed the action. `system` marks entries with no acting user
    // (e.g. seeding, automated re-chaining) so the UI need not infer it from
    // a missing id. We expose the person's name and role, never their raw PK.
    private boolean system;
    private String userName;
    private String userEmail;
    private String userRole;

    private String action;

    // What was acted on. `entityType` is the kind ("LandRecord", "Transfer");
    // `entityLabel` is a human-readable reference (e.g. a kitta number) instead
    // of a database id. `landRecordId` is only carried so the UI can link to the
    // record's detail page — it is used for navigation, not shown as data.
    private String entityType;
    private String entityLabel;
    private Long landRecordId;

    private String details;
    private String createdAt;
}
