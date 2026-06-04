package com.virtualwardrobe.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "try_on_jobs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TryOnJob {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "replicate_job_id", nullable = false)
  private String replicateJobId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "garment_id", nullable = false)
  private Garment garment;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TryOnStatus status;

  @Column(name = "result_url")
  private String resultUrl;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;
}
