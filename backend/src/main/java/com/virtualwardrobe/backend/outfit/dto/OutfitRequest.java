package com.virtualwardrobe.backend.outfit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record OutfitRequest(
    @NotBlank(message = "Name cannot be blank")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,
    @NotNull(message = "Garment list is required")
        @NotEmpty(message = "Outfit must contain at least one garment")
        List<@NotNull UUID> garmentIds) {}
