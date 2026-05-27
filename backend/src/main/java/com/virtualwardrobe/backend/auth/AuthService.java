package com.virtualwardrobe.backend.auth;

import com.virtualwardrobe.backend.auth.dto.RegisterRequest;
import com.virtualwardrobe.backend.auth.dto.RegisterResponse;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public RegisterResponse register(RegisterRequest registerRequest) {
    if (this.userRepository.findByEmail(registerRequest.email()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
    }

    String encodedPassword = this.passwordEncoder.encode(registerRequest.password());

    User user = new User();
    user.setEmail(registerRequest.email());
    user.setPasswordHash(encodedPassword);

    User savedUser = this.userRepository.save(user);

    return new RegisterResponse(savedUser.getId(), savedUser.getEmail());
  }
}
