package com.virtualwardrobe.backend.garment;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/garments")
public class GarmentController {

  private final GarmentService garmentService;

  public GarmentController(GarmentService garmentService) {
    this.garmentService = garmentService;
  }

  @GetMapping
  public ResponseEntity<List<GarmentResponse>> list(
      Authentication authentication,
      @RequestParam(required = false) Category category,
      @RequestParam(required = false) String tag) {
    return ResponseEntity.ok(garmentService.list(authentication.getName(), category, tag));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<GarmentResponse> create(
      Authentication authentication,
      @RequestPart("image") MultipartFile image,
      @Valid @RequestPart("metadata") GarmentRequest metadata) {
    GarmentResponse response = garmentService.create(authentication.getName(), metadata, image);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<GarmentResponse> update(
      Authentication authentication,
      @PathVariable UUID id,
      @Valid @RequestBody GarmentRequest request) {
    return ResponseEntity.ok(garmentService.update(authentication.getName(), id, request));
  }
}
