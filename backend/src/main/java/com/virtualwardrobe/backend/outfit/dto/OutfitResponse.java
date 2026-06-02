package com.virtualwardrobe.backend.outfit.dto;

import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OutfitResponse(
    UUID id, String name, Instant createdAt, List<GarmentResponse> garments) {}
