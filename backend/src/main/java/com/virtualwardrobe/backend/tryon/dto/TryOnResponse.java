package com.virtualwardrobe.backend.tryon.dto;

import java.util.UUID;

public record TryOnResponse(UUID jobId, String status) {}
