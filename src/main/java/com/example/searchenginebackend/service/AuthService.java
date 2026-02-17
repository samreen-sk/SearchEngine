package com.example.searchenginebackend.service;

import com.example.searchenginebackend.dto.AuthMeResponseDTO;
import com.example.searchenginebackend.exception.BadRequestException;
import com.example.searchenginebackend.exception.ResourceNotFoundException;
import com.example.searchenginebackend.model.Profile;
import com.example.searchenginebackend.repository.ProfileRepository;
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

        return new AuthMeResponseDTO(true, "USER", profile.getId(), profile.getDisplayName());
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
        return new AuthMeResponseDTO(true, "ADMIN", null, "admin");
    }

    public AuthMeResponseDTO me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return new AuthMeResponseDTO(false, null, null, null);
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            return new AuthMeResponseDTO(true, "ADMIN", null, "admin");
        }
        if (auth.getPrincipal() instanceof AuthenticatedProfile profile) {
            return new AuthMeResponseDTO(true, "USER", profile.profileId(), profile.displayName());
        }
        return new AuthMeResponseDTO(false, null, null, null);
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
