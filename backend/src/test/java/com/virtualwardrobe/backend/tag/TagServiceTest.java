package com.virtualwardrobe.backend.tag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.TagRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.tag.dto.TagRequest;
import com.virtualwardrobe.backend.tag.dto.TagResponse;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

  @Mock private TagRepository tagRepository;
  @Mock private UserRepository userRepository;

  private TagService tagService;
  private User user;

  @BeforeEach
  void setUp() {
    tagService = new TagService(tagRepository, userRepository);
    user = User.builder().id(UUID.randomUUID()).email("pawel@example.com").build();
  }

  @Test
  void listForUser_returnsTagsSortedAlphabetically() {
    Tag lato = Tag.builder().id(UUID.randomUUID()).name("lato").build();
    Tag casual = Tag.builder().id(UUID.randomUUID()).name("casual").user(user).build();
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(tagRepository.findAllByUserIdOrUserIdIsNull(user.getId()))
        .thenReturn(List.of(lato, casual));

    List<TagResponse> result = tagService.listForUser("pawel@example.com");

    assertThat(result).extracting(TagResponse::name).containsExactly("casual", "lato");
  }

  @Test
  void listForUser_throwsUnauthorizedWhenUserNotFound() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> tagService.listForUser("ghost@example.com"))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("401");

    verify(tagRepository, never()).findAllByUserIdOrUserIdIsNull(any());
  }

  @Test
  void create_createsTagWithNameNormalizedToLowercase() {
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(tagRepository.findByNameForUser("mój styl", user.getId())).thenReturn(List.of());
    Tag saved = Tag.builder().id(UUID.randomUUID()).name("mój styl").user(user).build();
    when(tagRepository.save(any(Tag.class))).thenReturn(saved);

    TagResponse result = tagService.create("pawel@example.com", new TagRequest("  Mój Styl  "));

    ArgumentCaptor<Tag> captor = ArgumentCaptor.forClass(Tag.class);
    verify(tagRepository).save(captor.capture());
    assertThat(captor.getValue().getName()).isEqualTo("mój styl");
    assertThat(result.name()).isEqualTo("mój styl");
  }

  @Test
  void create_throws409WhenGlobalTagDuplicate() {
    Tag global = Tag.builder().id(UUID.randomUUID()).name("casual").build();
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(tagRepository.findByNameForUser("casual", user.getId())).thenReturn(List.of(global));

    assertThatThrownBy(() -> tagService.create("pawel@example.com", new TagRequest("casual")))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("409");

    verify(tagRepository, never()).save(any());
  }

  @Test
  void create_throws409WhenOwnTagDuplicate() {
    Tag own = Tag.builder().id(UUID.randomUUID()).name("letni").user(user).build();
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(tagRepository.findByNameForUser("letni", user.getId())).thenReturn(List.of(own));

    assertThatThrownBy(() -> tagService.create("pawel@example.com", new TagRequest("letni")))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("409");

    verify(tagRepository, never()).save(any());
  }

  @Test
  void create_throws409WhenMixedCaseCollidesWithGlobalTag() {
    Tag global = Tag.builder().id(UUID.randomUUID()).name("casual").build();
    when(userRepository.findByEmail("pawel@example.com")).thenReturn(Optional.of(user));
    when(tagRepository.findByNameForUser("casual", user.getId())).thenReturn(List.of(global));

    assertThatThrownBy(() -> tagService.create("pawel@example.com", new TagRequest("CASUAL")))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("409");
  }

  @Test
  void create_throwsUnauthorizedWhenUserNotFound() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> tagService.create("ghost@example.com", new TagRequest("tag")))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("401");

    verify(tagRepository, never()).save(any());
  }
}
