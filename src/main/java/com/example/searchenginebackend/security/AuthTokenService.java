package com.example.searchenginebackend.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;

    @Value("${security.jwt.secret:change-this-secret}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:86400000}")
    private long expirationMs;

    @Value("${security.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public String createUserToken(Long profileId, String displayName) {
        return createToken("USER", profileId, displayName, "access", expirationMs);
    }

    public String createAdminToken() {
        return createToken("ADMIN", null, "admin", "access", expirationMs);
    }

    public String createUserRefreshToken(Long profileId, String displayName) {
        return createToken("USER", profileId, displayName, "refresh", refreshExpirationMs);
    }

    public String createAdminRefreshToken() {
        return createToken("ADMIN", null, "admin", "refresh", refreshExpirationMs);
    }

    public TokenPrincipal parseAccess(String token) {
        TokenPrincipal principal = parse(token);
        if (!"access".equals(principal.tokenType())) {
            throw new IllegalArgumentException("Invalid access token");
        }
        return principal;
    }

    public TokenPrincipal parseRefresh(String token) {
        TokenPrincipal principal = parse(token);
        if (!"refresh".equals(principal.tokenType())) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        return principal;
    }

    private TokenPrincipal parse(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid token format");
        }

        String data = parts[0] + "." + parts[1];
        String expected = sign(data);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Invalid token signature");
        }

        try {
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, MAP_TYPE);

            long exp = ((Number) payload.getOrDefault("exp", 0L)).longValue();
            if (Instant.now().toEpochMilli() > exp) {
                throw new IllegalArgumentException("Token expired");
            }

            String role = (String) payload.get("role");
            Long profileId = payload.get("profileId") == null ? null : ((Number) payload.get("profileId")).longValue();
            String displayName = (String) payload.get("displayName");
            String tokenType = (String) payload.getOrDefault("tokenType", "access");
            return new TokenPrincipal(role, profileId, displayName, tokenType);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid token payload", ex);
        }
    }

    private String createToken(String role, Long profileId, String displayName, String tokenType, long ttlMs) {
        try {
            String headerJson = objectMapper.writeValueAsString(Map.of("alg", "HS256", "typ", "JWT"));
            String header = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));

            long now = Instant.now().toEpochMilli();
            long exp = now + ttlMs;
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("role", role);
            payloadMap.put("profileId", profileId);
            payloadMap.put("displayName", displayName);
            payloadMap.put("tokenType", tokenType);
            payloadMap.put("iat", now);
            payloadMap.put("exp", exp);

            String payloadJson = objectMapper.writeValueAsString(payloadMap);
            String payload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            String data = header + "." + payload;
            return data + "." + sign(data);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to create token", ex);
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] signed = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signed);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign token", ex);
        }
    }

    public record TokenPrincipal(String role, Long profileId, String displayName, String tokenType) {}
}
