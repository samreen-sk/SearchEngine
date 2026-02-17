package com.example.searchenginebackend.service;

import com.example.searchenginebackend.dto.CreateProfileRequestDTO;
import com.example.searchenginebackend.dto.ProfileResponseDTO;
import com.example.searchenginebackend.dto.ProfileVerifyResponseDTO;
import com.example.searchenginebackend.exception.BadRequestException;
import com.example.searchenginebackend.exception.ResourceNotFoundException;
import com.example.searchenginebackend.model.Profile;
import com.example.searchenginebackend.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponseDTO createProfile(CreateProfileRequestDTO request) {
        String name = normalize(request.getDisplayName());
        String password = normalize(request.getPassword());

        if (name.isBlank()) {
            throw new BadRequestException("Display name is required");
        }
        if (password.isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (password.length() < 4) {
            throw new BadRequestException("Password must be at least 4 characters");
        }

        Profile profile = new Profile();
        profile.setDisplayName(name);
        profile.setPasswordHash(passwordEncoder.encode(password));

        Profile saved = profileRepository.save(profile);
        return toResponse(saved);
    }

    public List<ProfileResponseDTO> getPublicProfiles() {
        return profileRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProfileResponseDTO> getAllProfilesForAdmin() {
        return getPublicProfiles();
    }

    public ProfileVerifyResponseDTO verifyProfilePassword(Long profileId, String providedPassword) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        String password = normalize(providedPassword);
        boolean valid = passwordEncoder.matches(password, profile.getPasswordHash());
        if (!valid) {
            return new ProfileVerifyResponseDTO(false, "Invalid profile password");
        }
        return new ProfileVerifyResponseDTO(true, "Profile unlocked");
    }

    public void deleteProfile(Long profileId, String providedPassword) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        String password = normalize(providedPassword);
        if (!passwordEncoder.matches(password, profile.getPasswordHash())) {
            throw new BadRequestException("Invalid profile password");
        }
        profileRepository.delete(profile);
    }

    private ProfileResponseDTO toResponse(Profile profile) {
        return new ProfileResponseDTO(
                profile.getId(),
                profile.getDisplayName(),
                profile.getCreatedAt()
        );
    }

    private String normalize(String text) {
        return text == null ? "" : text.trim();
    }
}
