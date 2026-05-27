package com.virtualwardrobe.backend.auth;

import com.virtualwardrobe.backend.auth.dto.LoginResponse;
import com.virtualwardrobe.backend.auth.dto.RegisterRequest;
import com.virtualwardrobe.backend.auth.dto.RegisterResponse;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.UserRepository;
import com.virtualwardrobe.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      AuthenticationManager authenticationManager) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.authenticationManager = authenticationManager;
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

  public LoginResponse login(String email, String password) {
    try {
      this.authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(email, password));
    } catch (AuthenticationException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    User user = this.userRepository.findByEmail(email).orElseThrow();

    return new LoginResponse(this.jwtService.generateToken(user));
  }
}
