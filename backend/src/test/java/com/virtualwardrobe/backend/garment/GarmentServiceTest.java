package com.virtualwardrobe.backend.garment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.repository.TagRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.storage.StorageService;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GarmentServiceTest {

  @Mock private GarmentRepository garmentRepository;
  @Mock private TagRepository tagRepository;
  @Mock private UserRepository userRepository;
  @Mock private StorageService storageService;
  @Mock private GarmentMapper garmentMapper;

  private GarmentService garmentService;

  private User user;
  private final MultipartFile image =
      new MockMultipartFile("image", "cat.png", "image/png", "bytes".getBytes());

  @BeforeEach
  void setUp() {
    garmentService =
        new GarmentService(
            garmentRepository, tagRepository, userRepository, storageService, garmentMapper);
    user = User.builder().id(UUID.randomUUID()).email("pawel@example.com").build();
  }

  private GarmentRequest request(Set<String> tags) {
    return new GarmentRequest("Tee", "Nike", "red", "summer", Category.TOP, tags);
  }

  @Test
  void create_wgrywaPlikIZapisujeUbranieZUseremIKluczem() {
    GarmentRequest req = request(Set.of("casual"));
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(storageService.upload(image)).thenReturn("uuid.png");
    when(garmentMapper.toEntity(req)).thenReturn(new Garment());
    when(tagRepository.findByNameForUser("casual", user.getId())).thenReturn(List.of());
    when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> inv.getArgument(0, Tag.class));
    when(garmentRepository.save(any(Garment.class))).thenAnswer(inv -> inv.getArgument(0));
    when(garmentMapper.toResponse(any(Garment.class)))
        .thenReturn(
            new GarmentResponse(
                UUID.randomUUID(),
                "Tee",
                "Nike",
                "red",
                "summer",
                Category.TOP,
                "http://minio/wardrobe/uuid.png",
                Set.of("casual")));

    GarmentResponse response = garmentService.create("pawel@example.com", req, image);

    assertThat(response.imageUrl()).isEqualTo("http://minio/wardrobe/uuid.png");

    ArgumentCaptor<Garment> captor = ArgumentCaptor.forClass(Garment.class);
    verify(garmentRepository).save(captor.capture());
    Garment saved = captor.getValue();
    assertThat(saved.getUser()).isEqualTo(user);
    assertThat(saved.getImageUrl()).isEqualTo("uuid.png");
    assertThat(saved.getTags()).extracting(Tag::getName).containsExactly("casual");
  }

  @Test
  void create_reuzywaIstniejacegoTaguINieTworzyNowego() {
    GarmentRequest req = request(Set.of("casual"));
    Tag existing = Tag.builder().id(UUID.randomUUID()).name("casual").user(user).build();
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(storageService.upload(image)).thenReturn("uuid.png");
    when(garmentMapper.toEntity(req)).thenReturn(new Garment());
    when(tagRepository.findByNameForUser("casual", user.getId())).thenReturn(List.of(existing));
    when(garmentRepository.save(any(Garment.class))).thenAnswer(inv -> inv.getArgument(0));
    when(garmentMapper.toResponse(any(Garment.class)))
        .thenReturn(
            new GarmentResponse(
                UUID.randomUUID(), "Tee", "Nike", "red", "summer", Category.TOP, "url", Set.of()));

    garmentService.create("pawel@example.com", req, image);

    verify(tagRepository, never()).save(any(Tag.class));
    ArgumentCaptor<Garment> captor = ArgumentCaptor.forClass(Garment.class);
    verify(garmentRepository).save(captor.capture());
    assertThat(captor.getValue().getTags()).containsExactly(existing);
  }

  @Test
  void create_usuwaWgranyPlikGdyZapisDoBazySieNiePowiedzie() {
    GarmentRequest req = request(Set.of());
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(storageService.upload(image)).thenReturn("uuid.png");
    when(garmentMapper.toEntity(req)).thenReturn(new Garment());
    when(garmentRepository.save(any(Garment.class))).thenThrow(new RuntimeException("db down"));

    assertThatThrownBy(() -> garmentService.create("pawel@example.com", req, image))
        .isInstanceOf(RuntimeException.class);

    verify(storageService).delete("uuid.png");
  }

  @Test
  void create_rzucaUnauthorizedGdyBrakUseraINieWgrywaPliku() {
    GarmentRequest req = request(Set.of());
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> garmentService.create("ghost@example.com", req, image))
        .isInstanceOf(ResponseStatusException.class);

    verify(storageService, never()).upload(any());
  }

  @Test
  void list_przekazujeUserIdIFiltryDoRepoIMapujeWynik() {
    Garment garment = new Garment();
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(garmentRepository.findForUserFiltered(user.getId(), "TOP", "casual"))
        .thenReturn(List.of(garment));
    GarmentResponse mapped =
        new GarmentResponse(
            UUID.randomUUID(),
            "Tee",
            "Nike",
            "red",
            "summer",
            Category.TOP,
            "url",
            Set.of("casual"));
    when(garmentMapper.toResponse(garment)).thenReturn(mapped);

    List<GarmentResponse> result = garmentService.list("pawel@example.com", Category.TOP, "casual");

    assertThat(result).containsExactly(mapped);
    verify(garmentRepository).findForUserFiltered(user.getId(), "TOP", "casual");
  }

  @Test
  void list_przekazujeNullowePrzyBrakuFiltrow() {
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(garmentRepository.findForUserFiltered(user.getId(), null, null)).thenReturn(List.of());

    List<GarmentResponse> result = garmentService.list("pawel@example.com", null, null);

    assertThat(result).isEmpty();
    verify(garmentRepository).findForUserFiltered(user.getId(), null, null);
  }

  @Test
  void list_rzucaUnauthorizedGdyBrakUsera() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> garmentService.list("ghost@example.com", null, null))
        .isInstanceOf(ResponseStatusException.class);

    verify(garmentRepository, never()).findForUserFiltered(any(), any(), any());
  }
}
