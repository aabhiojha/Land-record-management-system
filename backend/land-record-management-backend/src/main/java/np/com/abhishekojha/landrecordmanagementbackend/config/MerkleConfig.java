package np.com.abhishekojha.landrecordmanagementbackend.config;

import np.com.abhishekojha.landrecordmanagementbackend.merkle.MerkleTreeEngine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MerkleConfig {

    @Bean
    public MerkleTreeEngine merkleTreeEngine() {
        return new MerkleTreeEngine();
    }
}
