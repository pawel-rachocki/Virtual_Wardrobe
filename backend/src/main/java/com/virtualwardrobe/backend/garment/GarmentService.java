package com.virtualwardrobe.backend.garment;

import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.repository.TagRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.storage.StorageService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
public class GarmentService {

  private final GarmentRepository garmentRepository;
  private final TagRepository tagRepository;
  private final UserRepository userRepository;
  private final StorageService storageService;
  private final GarmentMapper garmentMapper;

  public GarmentService(
      GarmentRepository garmentRepository,
      TagRepository tagRepository,
      UserRepository userRepository,
      StorageService storageService,
      GarmentMapper garmentMapper) {
    this.garmentRepository = garmentRepository;
    this.tagRepository = tagRepository;
    this.userRepository = userRepository;
    this.storageService = storageService;
    this.garmentMapper = garmentMapper;
  }

  /**
   * Tworzy ubranie dla uzytkownika z tokenu (izolacja multi-tenant, SPEC §7): wysyla zdjecie do
   * MinIO, zapisuje klucz w {@code image_url}, powiazuje tagi (Many-to-Many). Przy bledzie zapisu
   * usuwa wgrany plik, by nie zostawic sieroty.
   */
  @Transactional
  public GarmentResponse create(String userEmail, GarmentRequest request, MultipartFile image) {
    User user =
        userRepository
            .findByEmail(userEmail)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

    String key = storageService.upload(image);
    try {
      Garment garment = garmentMapper.toEntity(request);
      garment.setUser(user);
      garment.setImageUrl(key);
      garment.setTags(resolveTags(request.tags(), user));

      Garment saved = garmentRepository.save(garment);
      return garmentMapper.toResponse(saved);
    } catch (RuntimeException e) {
      safeDelete(key);
      throw e;
    }
  }

  /** Reuzywa istniejacy tag (wlasny lub globalny), preferujac wlasny; inaczej tworzy nowy usera. */
  private Set<Tag> resolveTags(Set<String> names, User user) {
    Set<Tag> tags = new HashSet<>();
    if (names == null) {
      return tags;
    }
    for (String name : names) {
      List<Tag> existing = tagRepository.findByNameForUser(name, user.getId());
      Tag tag =
          existing.stream()
              .filter(t -> t.getUser() != null)
              .findFirst()
              .or(() -> existing.stream().findFirst())
              .orElseGet(() -> tagRepository.save(Tag.builder().name(name).user(user).build()));
      tags.add(tag);
    }
    return tags;
  }

  private void safeDelete(String key) {
    try {
      storageService.delete(key);
    } catch (RuntimeException ex) {
      log.error("Failed to delete orphaned object {} after garment save error", key, ex);
    }
  }
}
