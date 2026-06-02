package com.virtualwardrobe.backend.outfit;

import com.virtualwardrobe.backend.domain.Outfit;
import com.virtualwardrobe.backend.garment.GarmentMapper;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.outfit.dto.OutfitResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class OutfitMapper {

  private final GarmentMapper garmentMapper;

  public OutfitMapper(GarmentMapper garmentMapper) {
    this.garmentMapper = garmentMapper;
  }

  public OutfitResponse toResponse(Outfit outfit) {
    List<GarmentResponse> garments =
        outfit.getGarments().stream().map(garmentMapper::toResponse).toList();

    return new OutfitResponse(outfit.getId(), outfit.getName(), outfit.getCreatedAt(), garments);
  }
}
