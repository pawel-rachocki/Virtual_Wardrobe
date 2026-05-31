package com.virtualwardrobe.backend.storage;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfig {

  @Bean
  public MinioClient minioClient(StorageProperties storageProperties) {
    return MinioClient.builder()
        .endpoint(storageProperties.getEndpoint())
        .credentials(storageProperties.getAccessKey(), storageProperties.getSecretKey())
        .build();
  }
}
