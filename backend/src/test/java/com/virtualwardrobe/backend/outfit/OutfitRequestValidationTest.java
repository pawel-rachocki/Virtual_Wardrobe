package com.virtualwardrobe.backend.outfit;

import static org.assertj.core.api.Assertions.assertThat;

import com.virtualwardrobe.backend.outfit.dto.OutfitRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class OutfitRequestValidationTest {

  private static ValidatorFactory factory;
  private static Validator validator;

  @BeforeAll
  static void setUp() {
    factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();
  }

  @AfterAll
  static void tearDown() {
    factory.close();
  }

  private OutfitRequest valid() {
    return new OutfitRequest("Casual Friday", List.of(UUID.randomUUID()));
  }

  @Test
  void passesWhenValid() {
    assertThat(validator.validate(valid())).isEmpty();
  }

  @Test
  void rejectsWhenNameIsBlank() {
    OutfitRequest request = new OutfitRequest("  ", List.of(UUID.randomUUID()));

    assertThat(validator.validate(request))
        .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
  }

  @Test
  void rejectsWhenNameIsNull() {
    OutfitRequest request = new OutfitRequest(null, List.of(UUID.randomUUID()));

    assertThat(validator.validate(request))
        .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
  }

  @Test
  void rejectsWhenNameExceedsMaxLength() {
    OutfitRequest request = new OutfitRequest("x".repeat(101), List.of(UUID.randomUUID()));

    assertThat(validator.validate(request))
        .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
  }

  @Test
  void rejectsWhenGarmentIdsIsNull() {
    OutfitRequest request = new OutfitRequest("Casual Friday", null);

    assertThat(validator.validate(request))
        .anyMatch(v -> v.getPropertyPath().toString().equals("garmentIds"));
  }

  @Test
  void rejectsWhenGarmentIdsIsEmpty() {
    OutfitRequest request = new OutfitRequest("Casual Friday", List.of());

    Set<ConstraintViolation<OutfitRequest>> violations = validator.validate(request);
    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("garmentIds"));
  }

  @Test
  void rejectsWhenGarmentIdsContainsNull() {
    List<UUID> ids = new ArrayList<>();
    ids.add(UUID.randomUUID());
    ids.add(null);
    OutfitRequest request = new OutfitRequest("Casual Friday", ids);

    assertThat(validator.validate(request))
        .anyMatch(v -> v.getPropertyPath().toString().contains("garmentIds"));
  }
}
