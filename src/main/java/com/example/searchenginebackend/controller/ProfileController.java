package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.CreateProfileRequestDTO;
import com.example.searchenginebackend.dto.DeleteProfileRequestDTO;
import com.example.searchenginebackend.dto.ProfileResponseDTO;
import com.example.searchenginebackend.dto.ProfileVerifyResponseDTO;
import com.example.searchenginebackend.dto.VerifyProfileRequestDTO;
import com.example.searchenginebackend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping
    public ProfileResponseDTO createProfile(@RequestBody CreateProfileRequestDTO request) {
        return profileService.createProfile(request);
    }

    @GetMapping
    public List<ProfileResponseDTO> publicProfiles() {
        return profileService.getPublicProfiles();
    }

    @PostMapping("/{id}/verify")
    public ProfileVerifyResponseDTO verifyProfile(
            @PathVariable("id") Long profileId,
            @RequestBody VerifyProfileRequestDTO request) {
        return profileService.verifyProfilePassword(profileId, request.getPassword());
    }

    @DeleteMapping("/{id}")
    public void deleteProfile(
            @PathVariable("id") Long profileId,
            @RequestBody DeleteProfileRequestDTO request) {
        profileService.deleteProfile(profileId, request.getPassword());
    }
}
