package com.virtualwardrobe.backend.repository;

import com.virtualwardrobe.backend.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    @Query("SELECT t FROM Tag t WHERE t.user.id = :userId OR t.user IS NULL")
    List<Tag> findAllByUserIdOrUserIdIsNull(@Param("userId") UUID userId);
}
