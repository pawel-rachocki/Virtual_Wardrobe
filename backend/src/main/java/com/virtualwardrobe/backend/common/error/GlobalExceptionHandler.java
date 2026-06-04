package com.virtualwardrobe.backend.common.error;

import com.virtualwardrobe.backend.replicate.TryOnException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(TryOnException.class)
  public ResponseEntity<ApiError> handleTryOn(TryOnException ex) {
    return ResponseEntity.status(ex.getStatus())
        .body(new ApiError(ex.getStatus().value(), ex.getMessage(), Map.of()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> fieldErrors = new HashMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
    }
    return ResponseEntity.badRequest()
        .body(new ApiError(HttpStatus.BAD_REQUEST.value(), "Validation failed", fieldErrors));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
    return ResponseEntity.badRequest()
        .body(new ApiError(HttpStatus.BAD_REQUEST.value(), "Malformed request body", Map.of()));
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
    String message = "Invalid value for parameter '" + ex.getName() + "'";
    return ResponseEntity.badRequest()
        .body(new ApiError(HttpStatus.BAD_REQUEST.value(), message, Map.of()));
  }
}
