package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.TryOnJob;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TryOnJobRepository extends JpaRepository<TryOnJob, UUID> {

  Optional<TryOnJob> findByIdAndUserId(UUID id, UUID userId);
}
