package com.virtualwardrobe.backend.garment;

import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.storage.StorageService;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class GarmentMapper {

  private final StorageService storageService;

  public GarmentMapper(StorageService storageService) {
    this.storageService = storageService;
  }

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

  /**
   * Nadpisuje pola skalarne istniejacej encji wartosciami z requestu (edycja #23). {@code tags},
   * {@code imageUrl} i {@code user} pozostaja poza mapperem — tagi ustawia serwis, a zdjecia i
   * wlasciciela edycja metadanych nie zmienia.
   */
  public void updateEntity(Garment target, GarmentRequest request) {
    target.setName(request.name());
    target.setBrand(request.brand());
    target.setColor(request.color());
    target.setSeason(request.season());
    target.setCategory(request.category());
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
        storageService.buildPublicUrl(garment.getImageUrl()),
        tagNames);
  }
}
