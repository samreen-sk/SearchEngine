package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthMeResponseDTO {
    private boolean authenticated;
    private String role;
    private Long profileId;
    private String displayName;
}
