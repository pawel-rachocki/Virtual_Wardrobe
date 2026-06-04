package com.virtualwardrobe.backend.replicate.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PredictionRequest {

  private String version;
  private PredictionInputDto input;
}
