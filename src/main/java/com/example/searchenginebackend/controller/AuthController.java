package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.AdminLoginRequestDTO;
import com.example.searchenginebackend.dto.AuthMeResponseDTO;
import com.example.searchenginebackend.dto.ProfileLoginRequestDTO;
import com.example.searchenginebackend.dto.RefreshTokenRequestDTO;
import com.example.searchenginebackend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/profile-login")
    public AuthMeResponseDTO profileLogin(@RequestBody ProfileLoginRequestDTO request, HttpServletRequest httpRequest) {
        return authService.loginProfile(request.getProfileId(), request.getPassword(), httpRequest);
    }

    @PostMapping("/admin-login")
    public AuthMeResponseDTO adminLogin(@RequestBody AdminLoginRequestDTO request, HttpServletRequest httpRequest) {
        return authService.loginAdmin(request.getPassword(), httpRequest);
    }

    @GetMapping("/me")
    public AuthMeResponseDTO me() {
        return authService.me();
    }

    @PostMapping("/refresh")
    public AuthMeResponseDTO refresh(@RequestBody RefreshTokenRequestDTO request) {
        return authService.refresh(request.getRefreshToken());
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
    }
}
