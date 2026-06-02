package com.virtualwardrobe.backend.garment;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.garment.dto.GarmentRequest;
import com.virtualwardrobe.backend.garment.dto.GarmentResponse;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.security.JwtAuthenticationFilter;
import com.virtualwardrobe.backend.security.JwtService;
import com.virtualwardrobe.backend.security.SecurityConfig;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

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
  void list_returns200WithListAndPassedFilters() throws Exception {
    when(garmentService.list(eq("pawel@example.com"), eq(Category.TOP), eq("casual")))
        .thenReturn(
            List.of(
                new GarmentResponse(
                    UUID.randomUUID(),
                    "Tee",
                    "Nike",
                    "red",
                    "summer",
                    Category.TOP,
                    "http://minio/wardrobe/uuid.png",
                    Set.of("casual"))));

    mockMvc
        .perform(
            get("/api/garments")
                .param("category", "TOP")
                .param("tag", "casual")
                .with(user("pawel@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Tee"))
        .andExpect(jsonPath("$[0].tags[0]").value("casual"));

    verify(garmentService).list("pawel@example.com", Category.TOP, "casual");
  }

  @Test
  void list_passesNullWhenNoQueryParams() throws Exception {
    when(garmentService.list(eq("pawel@example.com"), isNull(), isNull())).thenReturn(List.of());

    mockMvc
        .perform(get("/api/garments").with(user("pawel@example.com")))
        .andExpect(status().isOk());

    verify(garmentService).list("pawel@example.com", null, null);
  }

  @Test
  void list_returns401WhenNotAuthenticated() throws Exception {
    mockMvc.perform(get("/api/garments")).andExpect(status().isUnauthorized());

    verify(garmentService, never()).list(any(), any(), any());
  }

  @Test
  void list_returns400WhenInvalidCategory() throws Exception {
    mockMvc
        .perform(get("/api/garments").param("category", "FOO").with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(garmentService, never()).list(any(), any(), any());
  }

  @Test
  void create_returns201WithBodyWhenValidData() throws Exception {
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
  void create_returns400WhenMoreThan3Tags() throws Exception {
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
  void create_returns401WhenNotAuthenticated() throws Exception {
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[]}";

    mockMvc
        .perform(multipart("/api/garments").file(image()).file(metadata(json)))
        .andExpect(status().isUnauthorized());

    verify(garmentService, never()).create(any(), any(), any());
  }

  @Test
  void update_returns200WithUpdatedBody() throws Exception {
    UUID id = UUID.randomUUID();
    when(garmentService.update(eq("pawel@example.com"), eq(id), any(GarmentRequest.class)))
        .thenReturn(
            new GarmentResponse(
                id,
                "Tee v2",
                "Nike",
                "blue",
                "winter",
                Category.TOP,
                "http://minio/wardrobe/uuid.png",
                Set.of("sport")));

    String json =
        "{\"name\":\"Tee v2\",\"brand\":\"Nike\",\"color\":\"blue\",\"season\":\"winter\","
            + "\"category\":\"TOP\",\"tags\":[\"sport\"]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Tee v2"))
        .andExpect(jsonPath("$.color").value("blue"))
        .andExpect(jsonPath("$.tags[0]").value("sport"));

    verify(garmentService).update(eq("pawel@example.com"), eq(id), any(GarmentRequest.class));
  }

  @Test
  void update_returns400WhenMoreThan3Tags() throws Exception {
    UUID id = UUID.randomUUID();
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[\"a\",\"b\",\"c\",\"d\"]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(garmentService, never()).update(any(), any(), any());
  }

  @Test
  void update_returns400WhenInvalidCategory() throws Exception {
    UUID id = UUID.randomUUID();
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"FOO\",\"tags\":[]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(garmentService, never()).update(any(), any(), any());
  }

  @Test
  void update_returns404WhenGarmentNotFound() throws Exception {
    UUID id = UUID.randomUUID();
    when(garmentService.update(eq("pawel@example.com"), eq(id), any(GarmentRequest.class)))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Garment not found"));

    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isNotFound());
  }

  @Test
  void update_returns401WhenNotAuthenticated() throws Exception {
    UUID id = UUID.randomUUID();
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"TOP\",\"tags\":[]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id).contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isUnauthorized());

    verify(garmentService, never()).update(any(), any(), any());
  }

  @Test
  void delete_returns204WhenOwner() throws Exception {
    UUID id = UUID.randomUUID();

    mockMvc
        .perform(delete("/api/garments/{id}", id).with(user("pawel@example.com")))
        .andExpect(status().isNoContent());

    verify(garmentService).delete("pawel@example.com", id);
  }

  @Test
  void delete_returns404WhenGarmentNotFound() throws Exception {
    UUID id = UUID.randomUUID();
    org.mockito.Mockito.doThrow(
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Garment not found"))
        .when(garmentService)
        .delete("pawel@example.com", id);

    mockMvc
        .perform(delete("/api/garments/{id}", id).with(user("pawel@example.com")))
        .andExpect(status().isNotFound());
  }

  @Test
  void delete_returns401WhenNotAuthenticated() throws Exception {
    UUID id = UUID.randomUUID();

    mockMvc.perform(delete("/api/garments/{id}", id)).andExpect(status().isUnauthorized());

    verify(garmentService, never()).delete(any(), any());
  }
}
