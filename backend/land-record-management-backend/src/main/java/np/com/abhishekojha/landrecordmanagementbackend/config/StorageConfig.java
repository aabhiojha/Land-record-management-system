package np.com.abhishekojha.landrecordmanagementbackend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;

import java.net.URI;

/**
 * Wires up the S3 client used to store documents in an S3-compatible object
 * store (RustFS by default; MinIO or AWS S3 work the same way). Storing files
 * here instead of on the container's local disk means uploads survive when the
 * container is replaced.
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class StorageConfig {

    @Value("${app.storage.endpoint}")
    private String endpoint;

    @Value("${app.storage.region}")
    private String region;

    @Value("${app.storage.bucket}")
    private String bucket;

    @Value("${app.storage.access-key}")
    private String accessKey;

    @Value("${app.storage.secret-key}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                // Path-style is required for self-hosted servers like RustFS/MinIO,
                // which don't support the virtual-host bucket URLs that AWS uses.
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }

    /** Create the bucket on startup if it isn't there yet, so uploads just work. */
    @Bean
    public ApplicationRunner ensureBucketExists(S3Client s3) {
        return args -> {
            try {
                s3.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
            } catch (NoSuchBucketException e) {
                s3.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
                log.info("Created object storage bucket '{}'", bucket);
            } catch (Exception e) {
                // Don't crash the app if storage is unreachable at boot (e.g. in tests,
                // or if RustFS isn't up yet). Uploads will surface the error clearly.
                log.warn("Could not verify object storage bucket '{}' at startup: {}", bucket, e.getMessage());
            }
        };
    }
}
