package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.*;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.MerkleNodeEntity;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.MerkleNodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LandRecordIntegrityService {

    private final LandRecordRepository landRecordRepository;
    private final MerkleNodeRepository merkleNodeRepository;
    private final MerkleTreeEngine merkleTreeEngine;

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
                record.getCreatedAt().toString(),
                previousHash
        );
        return MerkleTreeEngine.computeRecordHash(input);
    }

    @Transactional
    public void rebuildMerkleTree() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrue();
        if (records.isEmpty()) return;

        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        MerkleTreeResult result = merkleTreeEngine.buildTree(leafHashes);

        int newVersion = merkleNodeRepository.findLatestTreeVersion().orElse(0) + 1;

        persistTree(result.getRoot(), null, records, newVersion);
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
        List<LandRecord> records = landRecordRepository.findByIsActiveTrue();
        if (records.isEmpty()) return null;

        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        MerkleTreeResult result = merkleTreeEngine.buildTree(leafHashes);
        return result.getRootHash();
    }

    public boolean verifyRecordHash(LandRecord record) {
        String computed = computeHash(record);
        return computed.equals(record.getRecordHash());
    }

    public List<ProofStep> generateProof(LandRecord record) {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrue();
        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        int leafIndex = -1;
        for (int i = 0; i < records.size(); i++) {
            if (records.get(i).getId().equals(record.getId())) {
                leafIndex = i;
                break;
            }
        }

        if (leafIndex == -1) return List.of();

        return merkleTreeEngine.generateProof(leafIndex, leafHashes);
    }

    public boolean verifyProof(LandRecord record) {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrue();
        List<String> leafHashes = records.stream()
                .map(LandRecord::getRecordHash)
                .toList();

        MerkleTreeResult tree = merkleTreeEngine.buildTree(leafHashes);
        List<ProofStep> proof = generateProof(record);

        return merkleTreeEngine.verifyProof(record.getRecordHash(), proof, tree.getRootHash());
    }

    public List<LandRecordHashInput> buildChainInputs() {
        List<LandRecord> records = landRecordRepository.findByIsActiveTrue();
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
                    record.getCreatedAt().toString(),
                    record.getPreviousRecordHash()
            ));
        }

        return inputs;
    }
}
