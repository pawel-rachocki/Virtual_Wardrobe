package com.virtualwardrobe.backend.replicate.dto;

import java.util.List;

public record ReplicatePrediction(String id, String status, List<String> output, String error) {}
