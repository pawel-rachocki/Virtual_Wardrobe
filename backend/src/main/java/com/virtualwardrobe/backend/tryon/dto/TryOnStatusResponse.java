package com.virtualwardrobe.backend.tryon.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TryOnStatusResponse(String status, String resultUrl) {}
