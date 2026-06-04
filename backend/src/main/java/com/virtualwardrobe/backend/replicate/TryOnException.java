package com.virtualwardrobe.backend.replicate;

import org.springframework.http.HttpStatus;

public class TryOnException extends RuntimeException {

  private final HttpStatus status;

  public TryOnException(String message, HttpStatus status) {
    super(message);
    this.status = status;
  }

  public TryOnException(String message, HttpStatus status, Throwable cause) {
    super(message, cause);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }
}
