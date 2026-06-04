package com.virtualwardrobe.backend.tryon;

import com.virtualwardrobe.backend.tryon.dto.TryOnRequest;
import com.virtualwardrobe.backend.tryon.dto.TryOnResponse;
import com.virtualwardrobe.backend.tryon.dto.TryOnStatusResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/try-on")
public class TryOnController {

  private final TryOnService tryOnService;

  public TryOnController(TryOnService tryOnService) {
    this.tryOnService = tryOnService;
  }

  @PostMapping
  public ResponseEntity<TryOnResponse> initiate(
      Authentication authentication, @Valid @RequestBody TryOnRequest request) {
    TryOnResponse response = tryOnService.initiate(authentication.getName(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping("/{jobId}/status")
  public ResponseEntity<TryOnStatusResponse> getStatus(
      Authentication authentication, @PathVariable UUID jobId) {
    TryOnStatusResponse response = tryOnService.getStatus(authentication.getName(), jobId);
    return ResponseEntity.ok(response);
  }
}
