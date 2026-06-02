package com.virtualwardrobe.backend.outfit;

import com.virtualwardrobe.backend.outfit.dto.OutfitRequest;
import com.virtualwardrobe.backend.outfit.dto.OutfitResponse;
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
@RequestMapping("/api/outfits")
public class OutfitController {

  private final OutfitService outfitService;

  public OutfitController(OutfitService outfitService) {
    this.outfitService = outfitService;
  }

  @GetMapping
  public ResponseEntity<List<OutfitResponse>> list(Authentication authentication) {
    List<OutfitResponse> outfits = outfitService.list(authentication.getName());
    return ResponseEntity.ok(outfits);
  }

  @PostMapping
  public ResponseEntity<OutfitResponse> create(
      Authentication authentication, @Valid @RequestBody OutfitRequest request) {
    OutfitResponse response = outfitService.create(authentication.getName(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
