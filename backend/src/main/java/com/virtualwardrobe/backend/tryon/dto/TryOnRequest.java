package com.virtualwardrobe.backend.tryon.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TryOnRequest(@NotNull(message = "Garment ID is required") UUID garmentId) {}
