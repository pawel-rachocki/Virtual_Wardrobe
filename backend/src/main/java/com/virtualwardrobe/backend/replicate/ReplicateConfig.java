package com.virtualwardrobe.backend.replicate;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ReplicateProperties.class)
public class ReplicateConfig {

  @Bean
  public RestClient replicateRestClient(ReplicateProperties props) {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(props.getTimeout());
    factory.setReadTimeout(props.getTimeout());

    return RestClient.builder()
        .requestFactory(factory)
        .baseUrl(props.getBaseUrl())
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Token " + props.getApiToken())
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
  }
}
