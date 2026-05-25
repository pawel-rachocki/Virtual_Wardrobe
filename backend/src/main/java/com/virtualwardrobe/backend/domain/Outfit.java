package com.virtualwardrobe.backend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "outfits")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Outfit {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false)
  @Size(min = 1, max = 100)
  private String name;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "outfit_garments",
      joinColumns = @JoinColumn(name = "outfit_id"),
      inverseJoinColumns = @JoinColumn(name = "garment_id"))
  @Builder.Default
  private Set<Garment> garments = new HashSet<>();
}
