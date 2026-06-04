package com.virtualwardrobe.backend.replicate;

import com.virtualwardrobe.backend.replicate.dto.PredictionInputDto;
import com.virtualwardrobe.backend.replicate.dto.PredictionRequest;
import com.virtualwardrobe.backend.replicate.dto.PredictionStatusResult;
import com.virtualwardrobe.backend.replicate.dto.ReplicatePrediction;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
public class ReplicateClient {

  private final RestClient restClient;
  private final ReplicateProperties props;

  public ReplicateClient(
      @Qualifier("replicateRestClient") RestClient restClient, ReplicateProperties props) {
    this.restClient = restClient;
    this.props = props;
  }

  public String createPrediction(
      String basePhotoUrl, String garmentImageUrl, String garmentDescription) {
    PredictionRequest request =
        PredictionRequest.builder()
            .version(props.getModelVersion())
            .input(
                PredictionInputDto.builder()
                    .humanImg(basePhotoUrl)
                    .garmImg(garmentImageUrl)
                    .garmentDes(garmentDescription)
                    .checked(true)
                    .checkedCrop(false)
                    .denoiseSteps(30)
                    .seed(42)
                    .build())
            .build();

    try {
      ReplicatePrediction response =
          restClient
              .post()
              .uri("/predictions")
              .body(request)
              .retrieve()
              .body(ReplicatePrediction.class);

      if (response == null || response.id() == null) {
        throw new TryOnException("Empty response from Replicate API", HttpStatus.BAD_GATEWAY);
      }
      return response.id();
    } catch (HttpClientErrorException e) {
      throw new TryOnException(resolveClientError(e), HttpStatus.BAD_GATEWAY, e);
    } catch (HttpServerErrorException e) {
      throw new TryOnException("Replicate service unavailable", HttpStatus.SERVICE_UNAVAILABLE, e);
    } catch (ResourceAccessException e) {
      throw new TryOnException("Replicate API timeout", HttpStatus.GATEWAY_TIMEOUT, e);
    }
  }

  public PredictionStatusResult getPredictionStatus(String predictionId) {
    try {
      ReplicatePrediction response =
          restClient
              .get()
              .uri("/predictions/{id}", predictionId)
              .retrieve()
              .body(ReplicatePrediction.class);

      if (response == null) {
        throw new TryOnException("Empty response from Replicate API", HttpStatus.BAD_GATEWAY);
      }

      String outputUrl =
          (response.output() != null && !response.output().isEmpty())
              ? response.output().get(0)
              : null;

      return new PredictionStatusResult(response.status(), outputUrl);
    } catch (HttpClientErrorException e) {
      throw new TryOnException(resolveClientError(e), HttpStatus.BAD_GATEWAY, e);
    } catch (HttpServerErrorException e) {
      throw new TryOnException("Replicate service unavailable", HttpStatus.SERVICE_UNAVAILABLE, e);
    } catch (ResourceAccessException e) {
      throw new TryOnException("Replicate API timeout", HttpStatus.GATEWAY_TIMEOUT, e);
    }
  }

  private String resolveClientError(HttpClientErrorException e) {
    if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
      return "Invalid Replicate API token";
    }
    if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
      return "Replicate model or prediction not found";
    }
    return "Replicate API error: " + e.getStatusCode();
  }
}
