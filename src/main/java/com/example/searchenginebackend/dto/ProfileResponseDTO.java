package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ProfileResponseDTO {
    private Long id;
    private String displayName;
    private LocalDateTime createdAt;
}
