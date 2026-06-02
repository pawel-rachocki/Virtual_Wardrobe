package com.virtualwardrobe.backend.outfit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.OutfitRepository;
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
class OutfitCrudIT extends AbstractPostgresIT {

  @Autowired private MockMvc mockMvc;
  @Autowired private JwtService jwtService;
  @Autowired private UserRepository userRepository;
  @Autowired private OutfitRepository outfitRepository;

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

  private String bearer(String token) {
    return "Bearer " + token;
  }

  private UUID createGarment(String token) throws Exception {
    MockMultipartFile image =
        new MockMultipartFile("image", "test.png", MediaType.IMAGE_PNG_VALUE, "img".getBytes());
    MockMultipartFile metadata =
        new MockMultipartFile(
            "metadata",
            "",
            MediaType.APPLICATION_JSON_VALUE,
            ("{\"name\":\"Tee\",\"brand\":\"Nike\",\"color\":\"red\",\"season\":\"summer\","
                    + "\"category\":\"TOP\",\"tags\":[]}")
                .getBytes());
    MvcResult result =
        mockMvc
            .perform(
                multipart("/api/garments")
                    .file(image)
                    .file(metadata)
                    .header("Authorization", bearer(token)))
            .andExpect(status().isCreated())
            .andReturn();
    String id = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    return UUID.fromString(id);
  }

  // --- create ---

  @Test
  void create_returns201WithCorrectFields() throws Exception {
    UUID garmentId = createGarment(tokenA);
    String json = "{\"name\":\"Casual Friday\",\"garmentIds\":[\"" + garmentId + "\"]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Casual Friday"))
        .andExpect(jsonPath("$.garments.length()").value(1))
        .andExpect(jsonPath("$.garments[0].id").value(garmentId.toString()));
  }

  @Test
  void create_savesOutfitAndRelationsInDatabase() throws Exception {
    UUID garmentId = createGarment(tokenA);
    String json = "{\"name\":\"Look\",\"garmentIds\":[\"" + garmentId + "\"]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isCreated());

    assertThat(outfitRepository.findAll()).hasSize(1);
    assertThat(outfitRepository.findAll().get(0).getGarments()).hasSize(1);
  }

  // --- multi-tenant isolation ---

  @Test
  void create_returns404WhenGarmentBelongsToAnotherUser() throws Exception {
    UUID garmentIdOfB = createGarment(tokenB);
    String json = "{\"name\":\"Look\",\"garmentIds\":[\"" + garmentIdOfB + "\"]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", bearer(tokenA)))
        .andExpect(status().isNotFound());

    assertThat(outfitRepository.findAll()).isEmpty();
  }

  // --- auth ---

  @Test
  void create_returns401WhenNotAuthenticated() throws Exception {
    String json = "{\"name\":\"Look\",\"garmentIds\":[\"" + UUID.randomUUID() + "\"]}";

    mockMvc
        .perform(post("/api/outfits").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isUnauthorized());
  }
}
