package com.virtualwardrobe.backend.user;

import com.virtualwardrobe.backend.user.dto.BasePhotoResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping(value = "/base-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<BasePhotoResponse> uploadBasePhoto(
      Authentication authentication, @RequestPart("file") MultipartFile file) {
    BasePhotoResponse response = userService.uploadBasePhoto(authentication.getName(), file);
    return ResponseEntity.ok(response);
  }
}
