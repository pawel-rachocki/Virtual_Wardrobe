package com.virtualwardrobe.backend.garment.dto;

import com.virtualwardrobe.backend.domain.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record GarmentRequest(
    @NotBlank(message = "Name cannot be blank")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,
    @NotBlank @Size(max = 100) String brand,
    @NotBlank @Size(max = 100) String color,
    @NotBlank @Size(max = 100) String season,
    @NotNull(message = "Category is required") Category category,
    @Size(max = 3, message = "A garment can have at most 3 tags")
        Set<@NotBlank @Size(max = 100) String> tags) {}
