package com.virtualwardrobe.backend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "garments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Garment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    @Size(min = 1, max = 100)
    private String name;

    @Column(nullable = false)
    @Size(min = 1, max = 100)
    private String brand;

    @Column(nullable = false)
    @Size(min = 1, max = 100)
    private String color;

    @Column(nullable = false)
    @Size(min = 1, max = 100)
    private String season;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "category")
    private Category category;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "garment_tags", joinColumns = @JoinColumn(name = "garment_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();
}
