package com.virtualwardrobe.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Email cannot be blank")
        @Email(message = "Please enter a valid email address")
        String email,
    @NotBlank(message = "Password cannot be blank")
        @Size(min = 8, max = 128, message = "Password must be at least 8 characters long")
        String password) {}
