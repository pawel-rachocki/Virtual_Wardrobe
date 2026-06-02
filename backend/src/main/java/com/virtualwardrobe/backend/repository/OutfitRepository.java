package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Outfit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutfitRepository extends JpaRepository<Outfit, UUID> {
  List<Outfit> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

  Optional<Outfit> findByIdAndUserId(UUID id, UUID userId);
}
