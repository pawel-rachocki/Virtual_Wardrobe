package com.virtualwardrobe.backend.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
public class StorageService {

  private final MinioClient minioClient;

  private final StorageProperties storageProperties;

  public StorageService(MinioClient minioClient, StorageProperties storageProperties) {
    this.minioClient = minioClient;
    this.storageProperties = storageProperties;
  }

  public String upload(MultipartFile file) {
    validate(file);
    String key = generateKey(file);

    try {
      minioClient.putObject(
          PutObjectArgs.builder().bucket(storageProperties.getBucket()).object(key).stream(
                  file.getInputStream(), file.getSize(), -1)
              .contentType(file.getContentType())
              .build());
      log.info("File uploaded successfully");
    } catch (Exception e) {
      log.error("Error uploading file: {}", e.getMessage());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading file");
    }

    return key;
  }

  public void delete(String key) {
    try {
      minioClient.removeObject(
          RemoveObjectArgs.builder().bucket(storageProperties.getBucket()).object(key).build());
    } catch (Exception e) {
      log.error("Error deleting file: {}", e.getMessage());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting file");
    }
  }

  private void validate(MultipartFile file) {
    if (file.isEmpty()
        || file.getSize() > 5_242_880
        || file.getContentType() == null
        || !file.getContentType().startsWith("image/")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file");
    }
  }

  private String generateKey(MultipartFile file) {
    String ext = extractExtension(file.getOriginalFilename());

    return UUID.randomUUID() + "." + ext;
  }

  private String extractExtension(String fileName) {
    if (fileName == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name is required");
    }

    int dot = fileName.lastIndexOf(".");

    if (dot < 0 || dot == fileName.length() - 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
    }

    return fileName.substring(dot + 1).toLowerCase();
  }
}
