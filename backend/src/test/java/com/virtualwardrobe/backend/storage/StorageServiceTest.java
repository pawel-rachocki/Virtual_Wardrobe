package com.virtualwardrobe.backend.storage;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class StorageServiceTest {

  @Mock private MinioClient minioClient;

  private StorageService storageService;

  @BeforeEach
  void setUp() {
    StorageProperties storageProperties = new StorageProperties();
    storageProperties.setBucket("wardrobe");
    storageService = new StorageService(minioClient, storageProperties);
  }

  @Test
  void upload_returnsKeyAndCallsPutObject_whenValidImage() throws Exception {
    MockMultipartFile file =
        new MockMultipartFile("file", "cat.png", "image/png", "fake-bytes".getBytes());

    String key = storageService.upload(file);

    assertTrue(key.endsWith(".png"), "Klucz powinien zachować rozszerzenie pliku");
    verify(minioClient).putObject(any(PutObjectArgs.class));
  }

  @Test
  void upload_throwsBadRequest_whenNotImage() {
    MockMultipartFile file =
        new MockMultipartFile("file", "doc.pdf", "application/pdf", "bytes".getBytes());

    assertThrows(ResponseStatusException.class, () -> storageService.upload(file));
  }

  @Test
  void upload_throwsBadRequest_whenTooLarge() {
    byte[] big = new byte[6 * 1024 * 1024]; // 6 MB > limit
    MockMultipartFile file = new MockMultipartFile("file", "big.png", "image/png", big);

    assertThrows(ResponseStatusException.class, () -> storageService.upload(file));
  }

  @Test
  void upload_throwsBadRequest_whenNoExtension() {
    MockMultipartFile file =
        new MockMultipartFile("file", "noext", "image/png", "bytes".getBytes());

    assertThrows(ResponseStatusException.class, () -> storageService.upload(file));
  }

  @Test
  void delete_callsRemoveObject() throws Exception {
    storageService.delete("some-key.png");

    verify(minioClient).removeObject(any(RemoveObjectArgs.class));
  }
}
