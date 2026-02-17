package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.AdminProfileDataDTO;
import com.example.searchenginebackend.dto.ProfileResponseDTO;
import com.example.searchenginebackend.service.AdminService;
import com.example.searchenginebackend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProfileService profileService;
    private final AdminService adminService;

    @GetMapping("/profiles")
    public List<ProfileResponseDTO> adminProfiles() {
        return profileService.getAllProfilesForAdmin();
    }

    @GetMapping("/profiles/{id}/data")
    public AdminProfileDataDTO adminProfileData(@PathVariable("id") Long profileId) {
        return adminService.getProfileData(profileId);
    }
}
