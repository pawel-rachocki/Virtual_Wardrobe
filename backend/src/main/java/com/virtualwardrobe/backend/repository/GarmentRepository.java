package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.domain.Garment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GarmentRepository extends JpaRepository<Garment, UUID> {

    List<Garment> findAllByUserId(UUID userId);

    List<Garment> findAllByUserIdAndCategory(UUID userId, Category category);
}
