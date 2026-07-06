package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.MerkleTreeResponse;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.*;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.MerkleNodeEntity;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.MerkleNodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LandRecordIntegrityService {

    /**
     * Fixed, explicit format used when a record's creation timestamp is folded
     * into its hash. {@code LocalDateTime.toString()} produces variable-length
     * output (it drops trailing zero seconds/nanos) and, more importantly, the
     * value is stored in the JVM with nanosecond precision but persisted in
     * PostgreSQL with only microsecond precision. Hashing the raw timestamp
     * therefore yields a different result before and after a DB round-trip,
     * flagging untouched records as tampered. Truncating to milliseconds (a
     * precision every backing store preserves exactly) and formatting with a
     * fixed 3-digit fraction makes the hash stable across persistence.
     */
    private static final DateTimeFormatter HASH_TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");

    private final LandRecordRepository landRecordRepository;
    private final MerkleNodeRepository merkleNodeRepository;
    private final MerkleTreeEngine merkleTreeEngine;

    static String canonicalTimestamp(LocalDateTime timestamp) {
        return timestamp.truncatedTo(ChronoUnit.MILLIS).format(HASH_TIMESTAMP_FORMAT);
    }

    public String computeHash(LandRecord record) {
        String previousHash = record.getPreviousRecordHash();
        LandRecordHashInput input = new LandRecordHashInput(
                record.getKittaNumber(),
                record.getCurrentOwner().getId(),
                record.getAreaSqMeters(),
                record.getDistrict(),
                record.getMunicipality(),
                record.getWardNumber(),
                record.getLandType().name(),
                canonicalTimestamp(record.getCreatedAt()),
                previousHash
        );
        return MerkleTreeEngine.computeRecordHash(input);
    }

    /**
     * Re-links and re-hashes the active record chain after a legitimate
     * mutation (e.g. an approved ownership transfer). A changed record
     * invalidates its own hash and the previousRecordHash link of every
     * record after it, so the chain must be recomputed from the first
     * affected record onward.
     */
    @Transactional
    public void rechainActiveRecords() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        String previousHash = null;

        for (LandRecord record : records) {
            if (!Objects.equals(previousHash, record.getPreviousRecordHash())) {
                record.setPreviousRecordHash(previousHash);
            }
            String computed = computeHash(record);
            if (!computed.equals(record.getRecordHash())) {
                record.setRecordHash(computed);
                landRecordRepository.save(record);
            }
            previousHash = record.getRecordHash();
        }
    }

    @Transactional
    public void rebuildMerkleTree() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        if (records.isEmpty()) return;

        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        MerkleTreeResult result = merkleTreeEngine.buildTree(leafHashes);

        int newVersion = merkleNodeRepository.findLatestTreeVersion().orElse(0) + 1;

        persistTree(result.getRoot(), null, records, newVersion);

        // Each rebuild persists a full copy of the tree. Without pruning,
        // merkle_nodes grows by O(records) on every create and every approved
        // transfer and never shrinks. Only the latest version is ever read, so
        // drop the superseded snapshots to keep storage bounded to one tree.
        // Links are detached first so the delete does not trip the
        // self-referential foreign keys on stricter databases.
        merkleNodeRepository.detachLinksByTreeVersionLessThan(newVersion);
        merkleNodeRepository.deleteByTreeVersionLessThan(newVersion);
    }

    private MerkleNodeEntity persistTree(MerkleNode node, MerkleNodeEntity parent,
                                         List<LandRecord> records, int version) {
        if (node == null) return null;

        MerkleNodeEntity entity = MerkleNodeEntity.builder()
                .hashValue(node.getHash())
                .nodeLevel(node.getLevel())
                .nodePosition(node.getPosition())
                .isLeaf(node.isLeaf())
                .treeVersion(version)
                .parent(parent)
                .build();

        if (node.isLeaf() && node.getPosition() < records.size()) {
            entity.setLandRecord(records.get(node.getPosition()));
        }

        entity = merkleNodeRepository.save(entity);

        MerkleNodeEntity leftChild = persistTree(node.getLeft(), entity, records, version);
        MerkleNodeEntity rightChild = persistTree(node.getRight(), entity, records, version);

        if (leftChild != null || rightChild != null) {
            entity.setLeftChild(leftChild);
            entity.setRightChild(rightChild);
            entity = merkleNodeRepository.save(entity);
        }

        return entity;
    }

    public String getCurrentMerkleRoot() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        if (records.isEmpty()) return null;

        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        MerkleTreeResult result = merkleTreeEngine.buildTree(leafHashes);
        return result.getRootHash();
    }

    /**
     * Snapshot of the current Merkle tree, level by level (leaves first), for
     * the verification UI. Leaves carry their record's id and kitta number;
     * padding copies (added when a level has an odd node count) are flagged so
     * the client can render them as duplicates.
     */
    @Transactional(readOnly = true)
    public MerkleTreeResponse getTreeSnapshot() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        if (records.isEmpty()) {
            return MerkleTreeResponse.builder()
                    .leafCount(0)
                    .treeHeight(0)
                    .levels(List.of())
                    .build();
        }

        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();
        MerkleTreeResult result = merkleTreeEngine.buildTree(leafHashes);

        Map<Integer, List<MerkleNode>> nodesByLevel = result.getAllNodes().stream()
                .collect(Collectors.groupingBy(MerkleNode::getLevel));

        List<List<MerkleTreeResponse.NodeResponse>> levels = new ArrayList<>();
        // Node count of the current level before padding; positions at or past
        // it belong to the duplicated padding node.
        int realNodeCount = records.size();

        for (int level = 0; level < nodesByLevel.size(); level++) {
            List<MerkleNode> nodes = new ArrayList<>(nodesByLevel.get(level));
            nodes.sort(Comparator.comparingInt(MerkleNode::getPosition));

            List<MerkleTreeResponse.NodeResponse> levelOut = new ArrayList<>(nodes.size());
            for (MerkleNode node : nodes) {
                LandRecord record = node.isLeaf() && node.getPosition() < records.size()
                        ? records.get(node.getPosition())
                        : null;
                levelOut.add(MerkleTreeResponse.NodeResponse.builder()
                        .hash(node.getHash())
                        .leaf(node.isLeaf())
                        .duplicate(node.getPosition() >= realNodeCount)
                        .recordId(record != null ? record.getId() : null)
                        .kittaNumber(record != null ? record.getKittaNumber() : null)
                        .build());
            }
            levels.add(levelOut);
            realNodeCount = nodes.size() / 2;
        }

        return MerkleTreeResponse.builder()
                .rootHash(result.getRootHash())
                .leafCount(result.getLeafCount())
                .treeHeight(result.getTreeHeight())
                .levels(levels)
                .build();
    }

    public boolean verifyRecordHash(LandRecord record) {
        String computed = computeHash(record);
        return computed.equals(record.getRecordHash());
    }

    public List<ProofStep> generateProof(LandRecord record) {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        return generateProof(record, records);
    }

    private List<ProofStep> generateProof(LandRecord record, List<LandRecord> records) {
        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        int leafIndex = indexOf(records, record.getId());
        if (leafIndex == -1) return List.of();

        return merkleTreeEngine.generateProof(leafIndex, leafHashes);
    }

    public boolean verifyProof(LandRecord record) {
        return fullVerification(record).proofValid();
    }

    private static int indexOf(List<LandRecord> records, Long recordId) {
        for (int i = 0; i < records.size(); i++) {
            if (records.get(i).getId().equals(recordId)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Snapshot of a single record's integrity check. Carries everything the
     * verification endpoint needs so it can be produced from one active-record
     * load and one Merkle tree build, instead of re-loading the whole table
     * and rebuilding the tree once per field (hash, proof, root).
     */
    public record RecordVerification(
            String computedHash,
            boolean hashValid,
            List<ProofStep> proof,
            String merkleRootHash,
            boolean proofValid
    ) {}

    @Transactional(readOnly = true)
    public RecordVerification fullVerification(LandRecord record) {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        String computedHash = computeHash(record);
        boolean hashValid = computedHash.equals(record.getRecordHash());

        String rootHash = records.isEmpty()
                ? null
                : merkleTreeEngine.buildTree(leafHashes).getRootHash();

        List<ProofStep> proof = generateProof(record, records);
        boolean proofValid = hashValid
                && rootHash != null
                && merkleTreeEngine.verifyProof(record.getRecordHash(), proof, rootHash);

        return new RecordVerification(computedHash, hashValid, proof, rootHash, proofValid);
    }

    public List<LandRecordHashInput> buildChainInputs() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrueOrderByIdAsc();
        List<LandRecordHashInput> inputs = new ArrayList<>();

        for (LandRecord record : records) {
            inputs.add(new LandRecordHashInput(
                    record.getKittaNumber(),
                    record.getCurrentOwner().getId(),
                    record.getAreaSqMeters(),
                    record.getDistrict(),
                    record.getMunicipality(),
                    record.getWardNumber(),
                    record.getLandType().name(),
                    canonicalTimestamp(record.getCreatedAt()),
                    record.getPreviousRecordHash()
            ));
        }

        return inputs;
    }
}
