package np.com.abhishekojha.landrecordmanagementbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.ChainVerificationResponse;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.VerificationResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.HashChainVerifier;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.LandRecordHashInput;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.ProofStep;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.service.LandRecordIntegrityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
@Tag(name = "Verification", description = "Merkle tree and hash chain verification")
public class VerificationController {

    private final LandRecordRepository landRecordRepository;
    private final LandRecordIntegrityService integrityService;

    @GetMapping("/record/{id}")
    @Operation(summary = "Verify a single land record's integrity")
    public ResponseEntity<VerificationResponse> verifyRecord(@PathVariable Long id) {
        LandRecord record = landRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Land record not found: " + id));

        String computedHash = integrityService.computeHash(record);
        boolean hashValid = computedHash.equals(record.getRecordHash());

        List<ProofStep> proof = integrityService.generateProof(record);
        boolean proofValid = hashValid && integrityService.verifyProof(record);

        String rootHash = integrityService.getCurrentMerkleRoot();

        return ResponseEntity.ok(VerificationResponse.builder()
                .recordId(record.getId())
                .kittaNumber(record.getKittaNumber())
                .valid(proofValid)
                .computedHash(computedHash)
                .storedHash(record.getRecordHash())
                .merkleRootHash(rootHash)
                .merkleProof(proof.stream()
                        .map(VerificationResponse.ProofStepResponse::from)
                        .toList())
                .message(proofValid ? "Record integrity verified" : "INTEGRITY VIOLATION DETECTED")
                .build());
    }

    @GetMapping("/chain")
    @Operation(summary = "Verify the entire hash chain integrity")
    public ResponseEntity<ChainVerificationResponse> verifyChain() {
        List<LandRecordHashInput> inputs = integrityService.buildChainInputs();

        boolean valid = HashChainVerifier.verifyChain(inputs);
        int brokenAt = HashChainVerifier.findBrokenLink(inputs);

        return ResponseEntity.ok(ChainVerificationResponse.builder()
                .valid(valid)
                .totalRecords(inputs.size())
                .brokenAtIndex(brokenAt)
                .message(valid ? "Hash chain is intact" : "Chain broken at record index " + brokenAt)
                .build());
    }

    @GetMapping("/tree-root")
    @Operation(summary = "Get current Merkle tree root hash")
    public ResponseEntity<Map<String, String>> getTreeRoot() {
        String rootHash = integrityService.getCurrentMerkleRoot();
        return ResponseEntity.ok(Map.of(
                "rootHash", rootHash != null ? rootHash : "NO_RECORDS",
                "message", rootHash != null ? "Current Merkle tree root" : "No active records"
        ));
    }

    @GetMapping("/record/{id}/proof")
    @Operation(summary = "Get Merkle proof path for a record")
    public ResponseEntity<List<VerificationResponse.ProofStepResponse>> getProof(@PathVariable Long id) {
        LandRecord record = landRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Land record not found: " + id));

        List<ProofStep> proof = integrityService.generateProof(record);
        return ResponseEntity.ok(proof.stream()
                .map(VerificationResponse.ProofStepResponse::from)
                .toList());
    }
}
