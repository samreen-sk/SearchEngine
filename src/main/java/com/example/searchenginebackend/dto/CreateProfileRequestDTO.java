package com.example.searchenginebackend.dto;

import lombok.Data;

@Data
public class CreateProfileRequestDTO {
    private String displayName;
    private String password;
}
