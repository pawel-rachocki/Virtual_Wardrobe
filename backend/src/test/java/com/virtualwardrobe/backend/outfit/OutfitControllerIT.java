package com.virtualwardrobe.backend.outfit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.virtualwardrobe.backend.outfit.dto.OutfitRequest;
import com.virtualwardrobe.backend.outfit.dto.OutfitResponse;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.security.JwtAuthenticationFilter;
import com.virtualwardrobe.backend.security.JwtService;
import com.virtualwardrobe.backend.security.SecurityConfig;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(OutfitController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class OutfitControllerIT {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private OutfitService outfitService;
  @MockitoBean private UserRepository userRepository;

  private static final UUID GARMENT_ID = UUID.randomUUID();

  private OutfitResponse stubResponse() {
    return new OutfitResponse(UUID.randomUUID(), "Casual Friday", Instant.now(), List.of());
  }

  @Test
  void create_returns201WithBody() throws Exception {
    when(outfitService.create(eq("pawel@example.com"), any(OutfitRequest.class)))
        .thenReturn(stubResponse());

    String json = "{\"name\":\"Casual Friday\",\"garmentIds\":[\"" + GARMENT_ID + "\"]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Casual Friday"));

    verify(outfitService).create(eq("pawel@example.com"), any(OutfitRequest.class));
  }

  @Test
  void create_returns400WhenNameIsBlank() throws Exception {
    String json = "{\"name\":\"\",\"garmentIds\":[\"" + GARMENT_ID + "\"]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(outfitService, never()).create(any(), any());
  }

  @Test
  void create_returns400WhenGarmentIdsIsEmpty() throws Exception {
    String json = "{\"name\":\"Look\",\"garmentIds\":[]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(outfitService, never()).create(any(), any());
  }

  @Test
  void create_returns400WhenGarmentIdsIsNull() throws Exception {
    String json = "{\"name\":\"Look\"}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(outfitService, never()).create(any(), any());
  }

  @Test
  void create_returns401WhenNotAuthenticated() throws Exception {
    String json = "{\"name\":\"Look\",\"garmentIds\":[\"" + GARMENT_ID + "\"]}";

    mockMvc
        .perform(post("/api/outfits").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isUnauthorized());

    verify(outfitService, never()).create(any(), any());
  }

  @Test
  void create_returns404WhenGarmentNotOwnedByUser() throws Exception {
    when(outfitService.create(eq("pawel@example.com"), any(OutfitRequest.class)))
        .thenThrow(
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Garment not found: " + GARMENT_ID));

    String json = "{\"name\":\"Look\",\"garmentIds\":[\"" + GARMENT_ID + "\"]}";

    mockMvc
        .perform(
            post("/api/outfits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(user("pawel@example.com")))
        .andExpect(status().isNotFound());
  }

  @Test
  void list_returns200WithBody() throws Exception {
    when(outfitService.list("pawel@example.com")).thenReturn(List.of(stubResponse()));

    mockMvc
        .perform(get("/api/outfits").with(user("pawel@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].name").value("Casual Friday"));

    verify(outfitService).list("pawel@example.com");
  }

  @Test
  void list_returns401WhenNotAuthenticated() throws Exception {
    mockMvc.perform(get("/api/outfits")).andExpect(status().isUnauthorized());

    verify(outfitService, never()).list(any());
  }

  @Test
  void list_returnsEmptyListWhenNoOutfits() throws Exception {
    when(outfitService.list("pawel@example.com")).thenReturn(List.of());

    mockMvc
        .perform(get("/api/outfits").with(user("pawel@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }
}
