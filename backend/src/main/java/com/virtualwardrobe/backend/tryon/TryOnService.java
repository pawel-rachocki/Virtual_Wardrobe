package com.virtualwardrobe.backend.tryon;

import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.TryOnJob;
import com.virtualwardrobe.backend.domain.TryOnStatus;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.replicate.ReplicateClient;
import com.virtualwardrobe.backend.replicate.dto.PredictionStatusResult;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.repository.TryOnJobRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.storage.StorageService;
import com.virtualwardrobe.backend.tryon.dto.TryOnRequest;
import com.virtualwardrobe.backend.tryon.dto.TryOnResponse;
import com.virtualwardrobe.backend.tryon.dto.TryOnStatusResponse;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TryOnService {

  private final UserRepository userRepository;
  private final GarmentRepository garmentRepository;
  private final TryOnJobRepository tryOnJobRepository;
  private final ReplicateClient replicateClient;
  private final StorageService storageService;

  public TryOnService(
      UserRepository userRepository,
      GarmentRepository garmentRepository,
      TryOnJobRepository tryOnJobRepository,
      ReplicateClient replicateClient,
      StorageService storageService) {
    this.userRepository = userRepository;
    this.garmentRepository = garmentRepository;
    this.tryOnJobRepository = tryOnJobRepository;
    this.replicateClient = replicateClient;
    this.storageService = storageService;
  }

  @Transactional
  public TryOnResponse initiate(String userEmail, TryOnRequest request) {
    User user =
        userRepository
            .findByEmail(userEmail)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

    if (user.getBasePhotoUrl() == null || user.getBasePhotoUrl().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User has no base photo");
    }

    Garment garment =
        garmentRepository
            .findByIdAndUserId(request.garmentId(), user.getId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Garment not found"));

    String description = garment.getName() + " " + garment.getBrand();
    String basePhotoUrl = storageService.buildReplicateUrl(user.getBasePhotoUrl());
    String garmentImageUrl = storageService.buildReplicateUrl(garment.getImageUrl());
    String replicateJobId =
        replicateClient.createPrediction(basePhotoUrl, garmentImageUrl, description);

    TryOnJob job =
        TryOnJob.builder()
            .user(user)
            .garment(garment)
            .replicateJobId(replicateJobId)
            .status(TryOnStatus.PENDING)
            .build();

    TryOnJob saved = tryOnJobRepository.save(job);
    return new TryOnResponse(saved.getId(), saved.getStatus().name());
  }

  @Transactional
  public TryOnStatusResponse getStatus(String userEmail, UUID jobId) {
    User user =
        userRepository
            .findByEmail(userEmail)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

    TryOnJob job =
        tryOnJobRepository
            .findByIdAndUserId(jobId, user.getId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Try-on job not found"));

    if (job.getStatus() == TryOnStatus.DONE || job.getStatus() == TryOnStatus.FAILED) {
      return new TryOnStatusResponse(job.getStatus().name(), job.getResultUrl());
    }

    PredictionStatusResult result = replicateClient.getPredictionStatus(job.getReplicateJobId());
    TryOnStatus mapped = mapReplicateStatus(result.status());

    job.setStatus(mapped);
    if (mapped == TryOnStatus.DONE) {
      job.setResultUrl(result.outputUrl());
    }
    tryOnJobRepository.save(job);

    return new TryOnStatusResponse(job.getStatus().name(), job.getResultUrl());
  }

  private TryOnStatus mapReplicateStatus(String replicateStatus) {
    return switch (replicateStatus) {
      case "succeeded" -> TryOnStatus.DONE;
      case "failed", "canceled" -> TryOnStatus.FAILED;
      default -> TryOnStatus.PROCESSING;
    };
  }
}
