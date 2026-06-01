package com.virtualwardrobe.backend.garment;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.security.JwtAuthenticationFilter;
import com.virtualwardrobe.backend.security.JwtService;
import com.virtualwardrobe.backend.security.SecurityConfig;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GarmentController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class GarmentControllerIT {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private GarmentService garmentService;
  @MockitoBean private UserRepository userRepository;

  private MockMultipartFile image() {
    return new MockMultipartFile("image", "cat.png", MediaType.IMAGE_PNG_VALUE, "bytes".getBytes());
  }

  private MockMultipartFile metadata(String json) {
    return new MockMultipartFile("metadata", "", MediaType.APPLICATION_JSON_VALUE, json.getBytes());
  }

  @Test
  void create_zwraca201IBodyGdyPoprawneDane() throws Exception {
    when(garmentService.create(eq("pawel@example.com"), any(GarmentRequest.class), any()))
        .thenReturn(
            new GarmentResponse(
                UUID.randomUUID(),
                "Tee",
                "Nike",
                "red",
                "summer",
                Category.TOP,
                "http://minio/wardrobe/uuid.png",
                Set.of("casual")));

    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[\"casual\"]}";

    mockMvc
        .perform(
            multipart("/api/garments")
                .file(image())
                .file(metadata(json))
                .with(user("pawel@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Tee"))
        .andExpect(jsonPath("$.imageUrl").value("http://minio/wardrobe/uuid.png"))
        .andExpect(jsonPath("$.tags[0]").value("casual"));
  }

  @Test
  void create_zwraca400GdyWiecejNiz3Tagi() throws Exception {
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[\"a\",\"b\",\"c\",\"d\"]}";

    mockMvc
        .perform(
            multipart("/api/garments")
                .file(image())
                .file(metadata(json))
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(garmentService, never()).create(any(), any(), any());
  }

  @Test
  void create_zwraca401GdyBrakAutentykacji() throws Exception {
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[]}";

    mockMvc
        .perform(multipart("/api/garments").file(image()).file(metadata(json)))
        .andExpect(status().isUnauthorized());

    verify(garmentService, never()).create(any(), any(), any());
  }
}
