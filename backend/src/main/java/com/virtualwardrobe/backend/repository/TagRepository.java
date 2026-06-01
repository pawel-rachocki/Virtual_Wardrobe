package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TagRepository extends JpaRepository<Tag, UUID> {

  @Query("SELECT t FROM Tag t WHERE t.user.id = :userId OR t.user IS NULL")
  List<Tag> findAllByUserIdOrUserIdIsNull(@Param("userId") UUID userId);

  /**
   * Tagi o danej nazwie widoczne dla uzytkownika: jego wlasne lub globalne (user IS NULL). Moze
   * zwrocic oba warianty — serwis wybiera, ktory reuzyc.
   */
  @Query("SELECT t FROM Tag t WHERE t.name = :name AND (t.user.id = :userId OR t.user IS NULL)")
  List<Tag> findByNameForUser(@Param("name") String name, @Param("userId") UUID userId);
}
