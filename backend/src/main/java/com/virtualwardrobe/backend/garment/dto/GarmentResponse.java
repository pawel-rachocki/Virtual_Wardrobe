package com.virtualwardrobe.backend.garment.dto;

import com.virtualwardrobe.backend.domain.Category;
import java.util.Set;
import java.util.UUID;

public record GarmentResponse(
    UUID id,
    String name,
    String brand,
    String color,
    String season,
    Category category,
    String imageUrl,
    Set<String> tags) {}
