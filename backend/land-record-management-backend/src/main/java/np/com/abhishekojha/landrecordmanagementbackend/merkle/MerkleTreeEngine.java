package np.com.abhishekojha.landrecordmanagementbackend.merkle;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

public class MerkleTreeEngine {

    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    public static String computeRecordHash(LandRecordHashInput input) {
        String raw = input.getKittaNumber()
                + "|" + input.getOwnerId()
                + "|" + input.getAreaSqMeters()
                + "|" + input.getDistrict()
                + "|" + input.getMunicipality()
                + "|" + input.getWardNumber()
                + "|" + input.getLandType()
                + "|" + input.getTimestamp()
                + "|" + input.getPreviousOrGenesis();
        return sha256(raw);
    }

    public MerkleTreeResult buildTree(List<String> leafHashes) {
        if (leafHashes == null || leafHashes.isEmpty()) {
            return new MerkleTreeResult(null, List.of(), 0, 0);
        }

        List<MerkleNode> allNodes = new ArrayList<>();

        List<MerkleNode> currentLevel = new ArrayList<>();
        for (int i = 0; i < leafHashes.size(); i++) {
            MerkleNode leaf = MerkleNode.leaf(leafHashes.get(i), i);
            currentLevel.add(leaf);
            allNodes.add(leaf);
        }

        if (currentLevel.size() > 1 && currentLevel.size() % 2 != 0) {
            MerkleNode dup = MerkleNode.leaf(currentLevel.getLast().getHash(), currentLevel.size());
            currentLevel.add(dup);
            allNodes.add(dup);
        }

        int level = 1;
        while (currentLevel.size() > 1) {
            List<MerkleNode> nextLevel = new ArrayList<>();

            for (int i = 0; i < currentLevel.size(); i += 2) {
                MerkleNode left = currentLevel.get(i);
                MerkleNode right = currentLevel.get(i + 1);
                String parentHash = sha256(left.getHash() + right.getHash());
                MerkleNode parent = MerkleNode.internal(parentHash, left, right, level, i / 2);
                nextLevel.add(parent);
                allNodes.add(parent);
            }

            if (nextLevel.size() > 1 && nextLevel.size() % 2 != 0) {
                MerkleNode dup = MerkleNode.internal(
                        nextLevel.getLast().getHash(),
                        nextLevel.getLast().getLeft(),
                        nextLevel.getLast().getRight(),
                        level,
                        nextLevel.size()
                );
                nextLevel.add(dup);
                allNodes.add(dup);
            }

            currentLevel = nextLevel;
            level++;
        }

        MerkleNode root = currentLevel.getFirst();
        int treeHeight = level;

        return new MerkleTreeResult(root, allNodes, leafHashes.size(), treeHeight);
    }

    public List<ProofStep> generateProof(int leafIndex, List<String> leafHashes) {
        if (leafHashes == null || leafHashes.isEmpty()) {
            return List.of();
        }
        if (leafIndex < 0 || leafIndex >= leafHashes.size()) {
            throw new IllegalArgumentException("Leaf index out of bounds: " + leafIndex);
        }

        List<List<String>> levels = new ArrayList<>();

        List<String> currentLevel = new ArrayList<>(leafHashes);
        if (currentLevel.size() > 1 && currentLevel.size() % 2 != 0) {
            currentLevel.add(currentLevel.getLast());
        }
        levels.add(currentLevel);

        while (currentLevel.size() > 1) {
            List<String> nextLevel = new ArrayList<>();
            for (int i = 0; i < currentLevel.size(); i += 2) {
                nextLevel.add(sha256(currentLevel.get(i) + currentLevel.get(i + 1)));
            }

            if (nextLevel.size() > 1 && nextLevel.size() % 2 != 0) {
                nextLevel.add(nextLevel.getLast());
            }

            levels.add(nextLevel);
            currentLevel = nextLevel;
        }

        List<ProofStep> proof = new ArrayList<>();
        int idx = leafIndex;

        for (int lvl = 0; lvl < levels.size() - 1; lvl++) {
            List<String> lvlHashes = levels.get(lvl);
            if (idx % 2 == 0) {
                proof.add(new ProofStep(lvlHashes.get(idx + 1), ProofStep.Position.RIGHT));
            } else {
                proof.add(new ProofStep(lvlHashes.get(idx - 1), ProofStep.Position.LEFT));
            }
            idx /= 2;
        }

        return proof;
    }

    public boolean verifyProof(String leafHash, List<ProofStep> proof, String expectedRoot) {
        String computed = leafHash;

        for (ProofStep step : proof) {
            if (step.getPosition() == ProofStep.Position.LEFT) {
                computed = sha256(step.getHash() + computed);
            } else {
                computed = sha256(computed + step.getHash());
            }
        }

        return computed.equals(expectedRoot);
    }
}
