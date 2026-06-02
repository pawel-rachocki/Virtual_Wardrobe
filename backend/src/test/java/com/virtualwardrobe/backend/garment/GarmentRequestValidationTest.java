package com.virtualwardrobe.backend.garment;

import static org.assertj.core.api.Assertions.assertThat;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class GarmentRequestValidationTest {

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

  private GarmentRequest valid(Set<String> tags) {
    return new GarmentRequest("Tee", "Nike", "red", "summer", Category.TOP, tags);
  }

  @Test
  void passesWhenValid() {
    Set<ConstraintViolation<GarmentRequest>> violations =
        validator.validate(valid(Set.of("casual", "sport")));

    assertThat(violations).isEmpty();
  }

  @Test
  void rejectsWhenMoreThan3Tags() {
    Set<ConstraintViolation<GarmentRequest>> violations =
        validator.validate(valid(Set.of("a", "b", "c", "d")));

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("tags"));
  }

  @Test
  void rejectsWhenNameIsBlank() {
    GarmentRequest request =
        new GarmentRequest("  ", "Nike", "red", "summer", Category.TOP, Set.of());

    Set<ConstraintViolation<GarmentRequest>> violations = validator.validate(request);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));
  }

  @Test
  void rejectsWhenCategoryIsNull() {
    GarmentRequest request = new GarmentRequest("Tee", "Nike", "red", "summer", null, Set.of());

    Set<ConstraintViolation<GarmentRequest>> violations = validator.validate(request);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("category"));
  }
}
