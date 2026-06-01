package com.virtualwardrobe.backend.garment;

import static org.assertj.core.api.Assertions.assertThat;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class GarmentMapperTest {

  private final GarmentMapper mapper = new GarmentMapper();

  @Test
  void toResponse_mapujePolaSkalarneITagi() {
    Tag tag = Tag.builder().name("casual").build();
    Garment garment =
        Garment.builder()
            .id(UUID.randomUUID())
            .name("Tee")
            .brand("Nike")
            .color("red")
            .season("summer")
            .category(Category.TOP)
            .imageUrl("http://minio/wardrobe/abc.png")
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
            .imageUrl("http://minio/wardrobe/x.png")
            .tags(null)
            .build();

    GarmentResponse response = mapper.toResponse(garment);

    assertThat(response.tags()).isEmpty();
  }
}
