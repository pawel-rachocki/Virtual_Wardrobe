package com.virtualwardrobe.backend.tag;

import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.TagRepository;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.tag.dto.TagRequest;
import com.virtualwardrobe.backend.tag.dto.TagResponse;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TagService {

  private final TagRepository tagRepository;
  private final UserRepository userRepository;

  public TagService(TagRepository tagRepository, UserRepository userRepository) {
    this.tagRepository = tagRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<TagResponse> listForUser(String userEmail) {
    User user = findUser(userEmail);
    return tagRepository.findAllByUserIdOrUserIdIsNull(user.getId()).stream()
        .map(t -> new TagResponse(t.getId(), t.getName()))
        .sorted(Comparator.comparing(TagResponse::name))
        .toList();
  }

  @Transactional
  public TagResponse create(String userEmail, TagRequest request) {
    User user = findUser(userEmail);
    String normalized = request.name().trim().toLowerCase();

    if (!tagRepository.findByNameForUser(normalized, user.getId()).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Tag already exists");
    }

    Tag saved = tagRepository.save(Tag.builder().name(normalized).user(user).build());
    return new TagResponse(saved.getId(), saved.getName());
  }

  private User findUser(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }
}
