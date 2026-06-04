package com.virtualwardrobe.backend.replicate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PredictionInputDto {

  @JsonProperty("human_img")
  private String humanImg;

  @JsonProperty("garm_img")
  private String garmImg;

  @JsonProperty("garment_des")
  private String garmentDes;

  @JsonProperty("is_checked")
  private boolean checked;

  @JsonProperty("is_checked_crop")
  private boolean checkedCrop;

  @JsonProperty("denoise_steps")
  private int denoiseSteps;

  private int seed;
}
