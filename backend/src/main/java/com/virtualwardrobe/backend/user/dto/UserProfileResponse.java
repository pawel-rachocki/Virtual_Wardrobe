package com.virtualwardrobe.backend.user.dto;

import java.util.UUID;

public record UserProfileResponse(UUID id, String email, String basePhotoUrl) {}
