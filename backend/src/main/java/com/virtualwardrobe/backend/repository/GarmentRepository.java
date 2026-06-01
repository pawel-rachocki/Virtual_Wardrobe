package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Garment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GarmentRepository extends JpaRepository<Garment, UUID> {

  /**
   * Pobiera ubranie tylko gdy nalezy do podanego usera (ownership + existence w jednym zapytaniu).
   * Cudze lub nieistniejace id zwraca pusty Optional. {@code LEFT JOIN FETCH} dociaga tagi, by
   * uniknac lazy-init przy mapowaniu odpowiedzi.
   */
  @Query(
      """
      SELECT g FROM Garment g
      LEFT JOIN FETCH g.tags
      WHERE g.id = :id AND g.user.id = :userId
      """)
  Optional<Garment> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

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
