package com.virtualwardrobe.backend.auth;

import com.virtualwardrobe.backend.auth.dto.LoginRequest;
import com.virtualwardrobe.backend.auth.dto.LoginResponse;
import com.virtualwardrobe.backend.auth.dto.RegisterRequest;
import com.virtualwardrobe.backend.auth.dto.RegisterResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<RegisterResponse> register(
      @Valid @RequestBody RegisterRequest registerRequest) {
    RegisterResponse response = this.authService.register(registerRequest);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
    LoginResponse response = this.authService.login(loginRequest.email(), loginRequest.password());
    return ResponseEntity.status(HttpStatus.OK).body(response);
  }
}
