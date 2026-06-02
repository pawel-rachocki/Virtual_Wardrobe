package com.virtualwardrobe.backend.tag;

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

import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.security.JwtAuthenticationFilter;
import com.virtualwardrobe.backend.security.JwtService;
import com.virtualwardrobe.backend.security.SecurityConfig;
import com.virtualwardrobe.backend.tag.dto.TagRequest;
import com.virtualwardrobe.backend.tag.dto.TagResponse;
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

@WebMvcTest(TagController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class TagControllerIT {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private TagService tagService;
  @MockitoBean private UserRepository userRepository;

  @Test
  void list_returns200WithTagList() throws Exception {
    when(tagService.listForUser("pawel@example.com"))
        .thenReturn(
            List.of(
                new TagResponse(UUID.randomUUID(), "casual"),
                new TagResponse(UUID.randomUUID(), "sport")));

    mockMvc
        .perform(get("/api/tags").with(user("pawel@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].name").value("casual"))
        .andExpect(jsonPath("$[1].name").value("sport"));

    verify(tagService).listForUser("pawel@example.com");
  }

  @Test
  void list_returns401WhenNotAuthenticated() throws Exception {
    mockMvc.perform(get("/api/tags")).andExpect(status().isUnauthorized());

    verify(tagService, never()).listForUser(any());
  }

  @Test
  void create_returns201WithNewTag() throws Exception {
    UUID id = UUID.randomUUID();
    when(tagService.create(eq("pawel@example.com"), any(TagRequest.class)))
        .thenReturn(new TagResponse(id, "letni"));

    mockMvc
        .perform(
            post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"letni\"}")
                .with(user("pawel@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.name").value("letni"));
  }

  @Test
  void create_returns409WhenDuplicate() throws Exception {
    when(tagService.create(eq("pawel@example.com"), any(TagRequest.class)))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Tag already exists"));

    mockMvc
        .perform(
            post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"casual\"}")
                .with(user("pawel@example.com")))
        .andExpect(status().isConflict());
  }

  @Test
  void create_returns400WhenNameIsBlank() throws Exception {
    mockMvc
        .perform(
            post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\"}")
                .with(user("pawel@example.com")))
        .andExpect(status().isBadRequest());

    verify(tagService, never()).create(any(), any());
  }

  @Test
  void create_returns401WhenNotAuthenticated() throws Exception {
    mockMvc
        .perform(
            post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"casual\"}"))
        .andExpect(status().isUnauthorized());

    verify(tagService, never()).create(any(), any());
  }
}
