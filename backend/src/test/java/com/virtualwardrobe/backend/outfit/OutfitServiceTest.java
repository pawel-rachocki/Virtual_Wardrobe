package com.virtualwardrobe.backend.outfit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Outfit;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.outfit.dto.OutfitRequest;
import com.virtualwardrobe.backend.outfit.dto.OutfitResponse;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.repository.OutfitRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class OutfitServiceTest {

  @Mock private OutfitRepository outfitRepository;
  @Mock private GarmentRepository garmentRepository;
  @Mock private UserRepository userRepository;
  @Mock private OutfitMapper outfitMapper;

  private OutfitService outfitService;

  private User user;

  @BeforeEach
  void setUp() {
    outfitService =
        new OutfitService(outfitRepository, garmentRepository, userRepository, outfitMapper);
    user = User.builder().id(UUID.randomUUID()).email("pawel@example.com").build();
  }

  private Garment garment(UUID id) {
    return Garment.builder().id(id).user(user).name("T-shirt").build();
  }

  private OutfitResponse stubResponse(UUID outfitId) {
    return new OutfitResponse(outfitId, "Casual Friday", Instant.now(), List.of());
  }

  // --- create ---

  @Test
  void create_createsOutfitWithGarmentList() {
    UUID g1 = UUID.randomUUID();
    UUID g2 = UUID.randomUUID();
    Garment garment1 = garment(g1);
    Garment garment2 = garment(g2);
    OutfitRequest request = new OutfitRequest("Casual Friday", List.of(g1, g2));
    Outfit savedOutfit = Outfit.builder().id(UUID.randomUUID()).name("Casual Friday").build();
    OutfitResponse expectedResponse = stubResponse(savedOutfit.getId());

    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(garmentRepository.findByIdAndUserId(g1, user.getId())).thenReturn(Optional.of(garment1));
    when(garmentRepository.findByIdAndUserId(g2, user.getId())).thenReturn(Optional.of(garment2));
    when(outfitRepository.save(any(Outfit.class))).thenReturn(savedOutfit);
    when(outfitMapper.toResponse(savedOutfit)).thenReturn(expectedResponse);

    OutfitResponse result = outfitService.create("pawel@example.com", request);

    assertThat(result).isEqualTo(expectedResponse);

    ArgumentCaptor<Outfit> captor = ArgumentCaptor.forClass(Outfit.class);
    verify(outfitRepository).save(captor.capture());
    Outfit saved = captor.getValue();
    assertThat(saved.getUser()).isEqualTo(user);
    assertThat(saved.getName()).isEqualTo("Casual Friday");
    assertThat(saved.getGarments()).containsExactlyInAnyOrder(garment1, garment2);
  }

  @Test
  void create_throwsNotFoundWhenGarmentDoesNotBelongToUser() {
    UUID unknownId = UUID.randomUUID();
    OutfitRequest request = new OutfitRequest("Look", List.of(unknownId));

    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(garmentRepository.findByIdAndUserId(unknownId, user.getId())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> outfitService.create("pawel@example.com", request))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("404")
        .hasMessageContaining(unknownId.toString());

    verify(outfitRepository, never()).save(any());
  }

  @Test
  void create_throwsNotFoundWhenAtLeastOneGarmentIsInvalid() {
    UUID validId = UUID.randomUUID();
    UUID invalidId = UUID.randomUUID();
    OutfitRequest request = new OutfitRequest("Look", List.of(validId, invalidId));

    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(garmentRepository.findByIdAndUserId(validId, user.getId()))
        .thenReturn(Optional.of(garment(validId)));
    when(garmentRepository.findByIdAndUserId(invalidId, user.getId())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> outfitService.create("pawel@example.com", request))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("404");

    verify(outfitRepository, never()).save(any());
  }

  @Test
  void create_throwsUnauthorizedWhenUserNotFound() {
    OutfitRequest request = new OutfitRequest("Look", List.of(UUID.randomUUID()));
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> outfitService.create("ghost@example.com", request))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("401");

    verify(garmentRepository, never()).findByIdAndUserId(any(), any());
    verify(outfitRepository, never()).save(any());
  }

  // --- list ---

  @Test
  void list_returnsUserOutfits() {
    Outfit outfit = Outfit.builder().id(UUID.randomUUID()).name("Look").build();
    OutfitResponse response = stubResponse(outfit.getId());

    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(outfitRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()))
        .thenReturn(List.of(outfit));
    when(outfitMapper.toResponse(outfit)).thenReturn(response);

    List<OutfitResponse> result = outfitService.list("pawel@example.com");

    assertThat(result).containsExactly(response);
  }

  @Test
  void list_throwsUnauthorizedWhenUserNotFound() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> outfitService.list("ghost@example.com"))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("401");

    verify(outfitRepository, never()).findAllByUserIdOrderByCreatedAtDesc(any());
  }

  // --- delete ---

  @Test
  void delete_deletesUserOutfit() {
    UUID outfitId = UUID.randomUUID();
    Outfit outfit = Outfit.builder().id(outfitId).user(user).name("Look").build();

    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(outfitRepository.findByIdAndUserId(outfitId, user.getId()))
        .thenReturn(Optional.of(outfit));

    outfitService.delete("pawel@example.com", outfitId);

    verify(outfitRepository).delete(outfit);
  }

  @Test
  void delete_throwsNotFoundWhenOutfitNotOwned() {
    UUID outfitId = UUID.randomUUID();

    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(outfitRepository.findByIdAndUserId(outfitId, user.getId())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> outfitService.delete("pawel@example.com", outfitId))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("404");

    verify(outfitRepository, never()).delete(any(Outfit.class));
  }

  @Test
  void delete_throwsUnauthorizedWhenUserNotFound() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> outfitService.delete("ghost@example.com", UUID.randomUUID()))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("401");

    verify(outfitRepository, never()).findByIdAndUserId(any(), any());
  }
}
