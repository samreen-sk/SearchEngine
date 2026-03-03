package com.example.searchenginebackend.service;

import com.example.searchenginebackend.dto.AuthMeResponseDTO;
import com.example.searchenginebackend.exception.BadRequestException;
import com.example.searchenginebackend.exception.ResourceNotFoundException;
import com.example.searchenginebackend.model.Profile;
import com.example.searchenginebackend.repository.ProfileRepository;
import com.example.searchenginebackend.security.AuthTokenService;
import com.example.searchenginebackend.security.AuthenticatedProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    @Value("${security.admin.password:admin123}")
    private String adminPassword;

    public AuthMeResponseDTO loginProfile(Long profileId, String password, HttpServletRequest request) {
        if (profileId == null || profileId <= 0) {
            throw new BadRequestException("Valid profile id is required");
        }
        String pwd = password == null ? "" : password.trim();
        if (pwd.isBlank()) {
            throw new BadRequestException("Password is required");
        }

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (!passwordEncoder.matches(pwd, profile.getPasswordHash())) {
            throw new BadRequestException("Invalid profile password");
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        AuthenticatedProfile principal = new AuthenticatedProfile(profile.getId(), profile.getDisplayName());
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
        persistAuthentication(authentication, request);

        String accessToken = authTokenService.createUserToken(profile.getId(), profile.getDisplayName());
        String refreshToken = authTokenService.createUserRefreshToken(profile.getId(), profile.getDisplayName());
        return new AuthMeResponseDTO(true, "USER", profile.getId(), profile.getDisplayName(), accessToken, refreshToken);
    }

    public AuthMeResponseDTO loginAdmin(String password, HttpServletRequest request) {
        String pwd = password == null ? "" : password.trim();
        if (pwd.isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (!adminPassword.equals(pwd)) {
            throw new BadRequestException("Invalid admin password");
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", null, authorities);
        persistAuthentication(authentication, request);

        String accessToken = authTokenService.createAdminToken();
        String refreshToken = authTokenService.createAdminRefreshToken();
        return new AuthMeResponseDTO(true, "ADMIN", null, "admin", accessToken, refreshToken);
    }

    public AuthMeResponseDTO refresh(String refreshToken) {
        String token = refreshToken == null ? "" : refreshToken.trim();
        if (token.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }
        AuthTokenService.TokenPrincipal principal = authTokenService.parseRefresh(token);
        if ("ADMIN".equals(principal.role())) {
            String newAccessToken = authTokenService.createAdminToken();
            String newRefreshToken = authTokenService.createAdminRefreshToken();
            return new AuthMeResponseDTO(true, "ADMIN", null, "admin", newAccessToken, newRefreshToken);
        }
        String displayName = principal.displayName() == null ? "User" : principal.displayName();
        String newAccessToken = authTokenService.createUserToken(principal.profileId(), displayName);
        String newRefreshToken = authTokenService.createUserRefreshToken(principal.profileId(), displayName);
        return new AuthMeResponseDTO(true, "USER", principal.profileId(), displayName, newAccessToken, newRefreshToken);
    }

    public AuthMeResponseDTO me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return new AuthMeResponseDTO(false, null, null, null, null, null);
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            return new AuthMeResponseDTO(true, "ADMIN", null, "admin", null, null);
        }
        if (auth.getPrincipal() instanceof AuthenticatedProfile profile) {
            return new AuthMeResponseDTO(true, "USER", profile.profileId(), profile.displayName(), null, null);
        }
        return new AuthMeResponseDTO(false, null, null, null, null, null);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    private void persistAuthentication(Authentication authentication, HttpServletRequest request) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = request.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", context);
    }
}
