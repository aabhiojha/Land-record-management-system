package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LandRecordHashInput {

    private static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    private final String kittaNumber;
    private final long ownerId;
    private final double areaSqMeters;
    private final String district;
    private final String municipality;
    private final int wardNumber;
    private final String landType;
    private final String timestamp;
    private final String previousRecordHash;

    public String getPreviousOrGenesis() {
        return previousRecordHash != null && !previousRecordHash.isBlank()
                ? previousRecordHash
                : GENESIS_HASH;
    }
}
