package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Outfit;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutfitRepository extends JpaRepository<Outfit, UUID> {
  List<Outfit> findAllByUserId(UUID userId);
}
