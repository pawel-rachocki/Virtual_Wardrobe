package com.virtualwardrobe.backend.garment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.security.JwtService;
import com.virtualwardrobe.backend.storage.StorageService;
import com.virtualwardrobe.backend.support.AbstractPostgresIT;
import io.minio.MinioClient;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Transactional
class GarmentCrudIT extends AbstractPostgresIT {

  private static final String BASE_JSON =
      "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
          + "\"category\":\"TOP\",\"tags\":[\"casual\"]}";

  @Autowired private MockMvc mockMvc;
  @Autowired private JwtService jwtService;
  @Autowired private UserRepository userRepository;
  @Autowired private GarmentRepository garmentRepository;

  @MockitoBean private StorageService storageService;
  @MockitoBean private MinioClient minioClient;

  private String tokenA;
  private String tokenB;

  @BeforeEach
  void setUp() {
    User userA =
        userRepository.save(User.builder().email("a@test.com").passwordHash("hash").build());
    User userB =
        userRepository.save(User.builder().email("b@test.com").passwordHash("hash").build());
    tokenA = jwtService.generateToken(userA);
    tokenB = jwtService.generateToken(userB);
    when(storageService.upload(any())).thenReturn("img-key.png");
  }

  private MockMultipartFile image() {
    return new MockMultipartFile("image", "test.png", MediaType.IMAGE_PNG_VALUE, "img".getBytes());
  }

  private MockMultipartFile metadata(String json) {
    return new MockMultipartFile("metadata", "", MediaType.APPLICATION_JSON_VALUE, json.getBytes());
  }

  private String bearer(String token) {
    return "Bearer " + token;
  }

  private UUID postGarment(String token, String json) throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                multipart("/api/garments")
                    .file(image())
                    .file(metadata(json))
                    .header("Authorization", bearer(token)))
            .andExpect(status().isCreated())
            .andReturn();
    String id = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    return UUID.fromString(id);
  }

  // --- CRUD ---

  @Test
  void create_returns201WithCorrectFields() throws Exception {
    mockMvc
        .perform(
            multipart("/api/garments")
                .file(image())
                .file(metadata(BASE_JSON))
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Tee"))
        .andExpect(jsonPath("$.brand").value("Nike"))
        .andExpect(jsonPath("$.category").value("TOP"))
        .andExpect(jsonPath("$.tags[0]").value("casual"));
  }

  @Test
  void create_savesRecordInDatabase() throws Exception {
    postGarment(tokenA, BASE_JSON);

    assertThat(garmentRepository.findAll()).hasSize(1);
  }

  @Test
  void list_returnsCreatedGarment() throws Exception {
    postGarment(tokenA, BASE_JSON);

    mockMvc
        .perform(get("/api/garments").header("Authorization", bearer(tokenA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].name").value("Tee"));
  }

  @Test
  void update_updatesFieldsAndReturns200() throws Exception {
    UUID id = postGarment(tokenA, BASE_JSON);
    String updated =
        "{\"name\":\"Shirt\",\"brand\":\"Adidas\",\"color\":\"blue\",\"season\":\"winter\","
            + "\"category\":\"TOP\",\"tags\":[\"sport\"]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updated)
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Shirt"))
        .andExpect(jsonPath("$.brand").value("Adidas"))
        .andExpect(jsonPath("$.tags[0]").value("sport"));
  }

  @Test
  void delete_returns204AndRemovesFromDatabase() throws Exception {
    UUID id = postGarment(tokenA, BASE_JSON);

    mockMvc
        .perform(delete("/api/garments/{id}", id).header("Authorization", bearer(tokenA)))
        .andExpect(status().isNoContent());

    assertThat(garmentRepository.findAll()).isEmpty();
    verify(storageService).delete("img-key.png");
  }

  // --- multi-tenant isolation ---

  @Test
  void list_userBCannotSeeUserAGarments() throws Exception {
    postGarment(tokenA, BASE_JSON);

    mockMvc
        .perform(get("/api/garments").header("Authorization", bearer(tokenB)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void update_returns404WhenGarmentBelongsToAnotherUser() throws Exception {
    UUID id = postGarment(tokenA, BASE_JSON);
    String body =
        "{\"name\":\"X\",\"brand\":\"X\",\"color\":\"X\",\"season\":\"X\","
            + "\"category\":\"TOP\",\"tags\":[]}";

    mockMvc
        .perform(
            put("/api/garments/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .header("Authorization", bearer(tokenB)))
        .andExpect(status().isNotFound());
  }

  @Test
  void delete_returns404WhenGarmentBelongsToAnotherUser() throws Exception {
    UUID id = postGarment(tokenA, BASE_JSON);

    mockMvc
        .perform(delete("/api/garments/{id}", id).header("Authorization", bearer(tokenB)))
        .andExpect(status().isNotFound());
  }

  // --- filtering ---

  @Test
  void list_filterByCategory_returnsOnlyMatchingGarments() throws Exception {
    postGarment(tokenA, BASE_JSON); // TOP, casual
    String bottomJson =
        "{\"name\":\"Pants\",\"brand\":\"H&M\",\"color\":\"blue\",\"season\":\"summer\","
            + "\"category\":\"BOTTOM\",\"tags\":[]}";
    postGarment(tokenA, bottomJson);

    mockMvc
        .perform(
            get("/api/garments").param("category", "TOP").header("Authorization", bearer(tokenA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].name").value("Tee"));
  }

  @Test
  void list_filterByTag_returnsOnlyMatchingGarments() throws Exception {
    postGarment(tokenA, BASE_JSON); // casual
    String sportJson =
        "{\"name\":\"Pants\",\"brand\":\"H&M\",\"color\":\"blue\",\"season\":\"summer\","
            + "\"category\":\"BOTTOM\",\"tags\":[\"sport\"]}";
    postGarment(tokenA, sportJson);

    mockMvc
        .perform(
            get("/api/garments").param("tag", "casual").header("Authorization", bearer(tokenA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].name").value("Tee"));
  }

  @Test
  void list_filterByCategoryAndTag_returnsIntersection() throws Exception {
    postGarment(tokenA, BASE_JSON); // TOP, casual
    String bottomCasualJson =
        "{\"name\":\"Pants\",\"brand\":\"H&M\",\"color\":\"blue\",\"season\":\"summer\","
            + "\"category\":\"BOTTOM\",\"tags\":[\"casual\"]}";
    postGarment(tokenA, bottomCasualJson); // BOTTOM, casual

    mockMvc
        .perform(
            get("/api/garments")
                .param("category", "TOP")
                .param("tag", "casual")
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].name").value("Tee"));
  }

  // --- validation ---

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
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void create_returns400WhenInvalidCategory() throws Exception {
    String json =
        "{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
            + "\"category\":\"FOO\",\"tags\":[]}";

    mockMvc
        .perform(
            multipart("/api/garments")
                .file(image())
                .file(metadata(json))
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isBadRequest());
  }

  // --- auth ---

  @Test
  void create_returns401WhenNotAuthenticated() throws Exception {
    mockMvc
        .perform(multipart("/api/garments").file(image()).file(metadata(BASE_JSON)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void list_returns401WhenNotAuthenticated() throws Exception {
    mockMvc.perform(get("/api/garments")).andExpect(status().isUnauthorized());
  }
}
