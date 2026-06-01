package com.virtualwardrobe.backend.garment;

import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<GarmentResponse> create(
      Authentication authentication,
      @RequestPart("image") MultipartFile image,
      @Valid @RequestPart("metadata") GarmentRequest metadata) {
    GarmentResponse response = garmentService.create(authentication.getName(), metadata, image);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
