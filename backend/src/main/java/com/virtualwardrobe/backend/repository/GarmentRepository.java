package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Garment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GarmentRepository extends JpaRepository<Garment, UUID> {

  @Query(
      """
      SELECT DISTINCT g FROM Garment g
      LEFT JOIN FETCH g.tags
      WHERE g.user.id = :userId
        AND (:category IS NULL OR CAST(g.category AS string) = :category)
        AND (:tag IS NULL OR EXISTS (SELECT 1 FROM g.tags t WHERE t.name = :tag))
      ORDER BY g.name
      """)
  List<Garment> findForUserFiltered(
      @Param("userId") UUID userId, @Param("category") String category, @Param("tag") String tag);
}
