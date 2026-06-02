package com.virtualwardrobe.backend.outfit;

import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Outfit;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.outfit.dto.OutfitRequest;
import com.virtualwardrobe.backend.outfit.dto.OutfitResponse;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.repository.OutfitRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OutfitService {

  private final OutfitRepository outfitRepository;
  private final GarmentRepository garmentRepository;
  private final UserRepository userRepository;
  private final OutfitMapper outfitMapper;

  public OutfitService(
      OutfitRepository outfitRepository,
      GarmentRepository garmentRepository,
      UserRepository userRepository,
      OutfitMapper outfitMapper) {
    this.outfitRepository = outfitRepository;
    this.garmentRepository = garmentRepository;
    this.userRepository = userRepository;
    this.outfitMapper = outfitMapper;
  }

  @Transactional
  public OutfitResponse create(String userEmail, OutfitRequest request) {
    User user = resolveUser(userEmail);

    Set<Garment> garments = new LinkedHashSet<>();
    for (UUID garmentId : request.garmentIds()) {
      Garment garment =
          garmentRepository
              .findByIdAndUserId(garmentId, user.getId())
              .orElseThrow(
                  () ->
                      new ResponseStatusException(
                          HttpStatus.NOT_FOUND, "Garment not found: " + garmentId));
      garments.add(garment);
    }

    Outfit outfit = Outfit.builder().user(user).name(request.name()).garments(garments).build();

    return outfitMapper.toResponse(outfitRepository.save(outfit));
  }

  @Transactional(readOnly = true)
  public List<OutfitResponse> list(String userEmail) {
    User user = resolveUser(userEmail);
    return outfitRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(outfitMapper::toResponse)
        .toList();
  }

  @Transactional
  public void delete(String userEmail, UUID id) {
    User user = resolveUser(userEmail);
    Outfit outfit =
        outfitRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Outfit not found"));
    outfitRepository.delete(outfit);
  }

  private User resolveUser(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }
}
