package np.com.abhishekojha.landrecordmanagementbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.ProofStep;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class VerificationResponse {

    private Long recordId;
    private String kittaNumber;
    private boolean valid;
    private String computedHash;
    private String storedHash;
    private String merkleRootHash;
    private List<ProofStepResponse> merkleProof;
    private String message;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class ProofStepResponse {
        private String hash;
        private String position;

        public static ProofStepResponse from(ProofStep step) {
            return ProofStepResponse.builder()
                    .hash(step.getHash())
                    .position(step.getPosition().name())
                    .build();
        }
    }
}
