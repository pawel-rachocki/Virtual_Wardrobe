package com.virtualwardrobe.backend.tag;

import com.virtualwardrobe.backend.tag.dto.TagRequest;
import com.virtualwardrobe.backend.tag.dto.TagResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tags")
public class TagController {

  private final TagService tagService;

  public TagController(TagService tagService) {
    this.tagService = tagService;
  }

  @GetMapping
  public ResponseEntity<List<TagResponse>> list(Authentication authentication) {
    return ResponseEntity.ok(tagService.listForUser(authentication.getName()));
  }

  @PostMapping
  public ResponseEntity<TagResponse> create(
      Authentication authentication, @Valid @RequestBody TagRequest request) {
    TagResponse created = tagService.create(authentication.getName(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }
}
