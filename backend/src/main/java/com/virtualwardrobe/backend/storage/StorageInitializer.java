package com.virtualwardrobe.backend.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StorageInitializer implements CommandLineRunner {

  private final MinioClient minioClient;
  private final StorageProperties storageProperties;

  public StorageInitializer(MinioClient minioClient, StorageProperties storageProperties) {
    this.minioClient = minioClient;
    this.storageProperties = storageProperties;
  }

  @Override
  public void run(String... args) throws Exception {

    String bucket = storageProperties.getBucket();

    if (!(minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build()))) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
      minioClient.setBucketPolicy(
          SetBucketPolicyArgs.builder().bucket(bucket).config(publicReadPolicy(bucket)).build());
      log.info("Bucket created successfully");
    } else {
      log.info("Bucket already exists");
    }
  }

  private String publicReadPolicy(String bucket) {
    return """
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": "*",
              "Action": ["s3:GetObject"],
              "Resource": ["arn:aws:s3:::%s/*"]
            }
          ]
        }
        """
        .formatted(bucket);
  }
}
