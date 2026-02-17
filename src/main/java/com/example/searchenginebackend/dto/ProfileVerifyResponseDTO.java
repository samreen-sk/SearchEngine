package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileVerifyResponseDTO {
    private boolean valid;
    private String message;
}
