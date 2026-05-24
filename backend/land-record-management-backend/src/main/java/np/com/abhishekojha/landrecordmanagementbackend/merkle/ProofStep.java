package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProofStep {

    private final String hash;
    private final Position position;

    public enum Position {
        LEFT, RIGHT
    }
}
