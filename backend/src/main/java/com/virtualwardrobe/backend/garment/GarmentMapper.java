package com.virtualwardrobe.backend.garment;

import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class GarmentMapper {

  /**
   * Mapuje tylko pola skalarne. {@code user}, {@code imageUrl} i {@code tags} ustawia serwis
   * (#21/#25), bo wymagaja kontekstu uzytkownika i repozytoriow.
   */
  public Garment toEntity(GarmentRequest request) {
    return Garment.builder()
        .name(request.name())
        .brand(request.brand())
        .color(request.color())
        .season(request.season())
        .category(request.category())
        .build();
  }

  public GarmentResponse toResponse(Garment garment) {
    Set<String> tagNames =
        garment.getTags() == null
            ? Set.of()
            : garment.getTags().stream().map(Tag::getName).collect(Collectors.toSet());

    return new GarmentResponse(
        garment.getId(),
        garment.getName(),
        garment.getBrand(),
        garment.getColor(),
        garment.getSeason(),
        garment.getCategory(),
        garment.getImageUrl(),
        tagNames);
  }
}
