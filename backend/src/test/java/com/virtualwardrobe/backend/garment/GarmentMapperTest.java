package com.virtualwardrobe.backend.garment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.storage.StorageService;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GarmentMapperTest {

  @Mock private StorageService storageService;

  private GarmentMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = new GarmentMapper(storageService);
    lenient()
        .when(storageService.buildPublicUrl("abc.png"))
        .thenReturn("http://minio/wardrobe/abc.png");
    lenient()
        .when(storageService.buildPublicUrl("x.png"))
        .thenReturn("http://minio/wardrobe/x.png");
  }

  @Test
  void toResponse_budujeUrlZKluczaIMapujeTagi() {
    Tag tag = Tag.builder().name("casual").build();
    Garment garment =
        Garment.builder()
            .id(UUID.randomUUID())
            .name("Tee")
            .brand("Nike")
            .color("red")
            .season("summer")
            .category(Category.TOP)
            .imageUrl("abc.png")
            .tags(Set.of(tag))
            .build();

    GarmentResponse response = mapper.toResponse(garment);

    assertThat(response.id()).isEqualTo(garment.getId());
    assertThat(response.name()).isEqualTo("Tee");
    assertThat(response.category()).isEqualTo(Category.TOP);
    assertThat(response.imageUrl()).isEqualTo("http://minio/wardrobe/abc.png");
    assertThat(response.tags()).containsExactly("casual");
  }

  @Test
  void toResponse_zwracaPustyZbiorGdyTagiNull() {
    Garment garment =
        Garment.builder()
            .id(UUID.randomUUID())
            .name("Jeans")
            .brand("Levis")
            .color("blue")
            .season("all")
            .category(Category.BOTTOM)
            .imageUrl("x.png")
            .tags(null)
            .build();

    GarmentResponse response = mapper.toResponse(garment);

    assertThat(response.tags()).isEmpty();
  }
}
