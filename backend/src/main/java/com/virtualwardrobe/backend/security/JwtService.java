package com.virtualwardrobe.backend.security;

import com.virtualwardrobe.backend.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  @Value("${jwt.secret}")
  private String secretKey;

  @Value("${jwt.expiration}")
  private long jwtExpirationTime;

  private SecretKey signingKey;

  @PostConstruct
  private void init() {
    byte[] key = Decoders.BASE64.decode(secretKey);
    signingKey = Keys.hmacShaKeyFor(key);
  }

  public String generateToken(User user) {
    return Jwts.builder()
        .subject(user.getEmail())
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + jwtExpirationTime))
        .signWith(signingKey)
        .compact();
  }

  public boolean isTokenValid(String token) {
    return extractExpiration(token).after(new Date());
  }

  public String extractEmail(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims =
        Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    return claimsResolver.apply(claims);
  }
}
