package com.virtualwardrobe.backend.replicate;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "replicate")
public class ReplicateProperties {

  private String apiToken;
  private String modelVersion;
  private String baseUrl = "https://api.replicate.com/v1";
  private Duration timeout = Duration.ofSeconds(30);
}
