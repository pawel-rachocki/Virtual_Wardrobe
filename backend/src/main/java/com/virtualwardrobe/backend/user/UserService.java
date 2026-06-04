package com.virtualwardrobe.backend.user;

import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.storage.StorageService;
import com.virtualwardrobe.backend.user.dto.BasePhotoResponse;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

  private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png");

  private final UserRepository userRepository;
  private final StorageService storageService;

  public UserService(UserRepository userRepository, StorageService storageService) {
    this.userRepository = userRepository;
    this.storageService = storageService;
  }

  @Transactional
  public BasePhotoResponse uploadBasePhoto(String userEmail, MultipartFile file) {
    User user =
        userRepository
            .findByEmail(userEmail)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

    if (file.isEmpty() || !ALLOWED_TYPES.contains(file.getContentType())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File must be JPG or PNG");
    }

    String key = "users/" + user.getId() + "/base-photo.jpg";
    storageService.uploadWithKey(file, key);

    String url = storageService.buildPublicUrl(key);
    user.setBasePhotoUrl(url);
    userRepository.save(user);

    return new BasePhotoResponse(url);
  }
}
