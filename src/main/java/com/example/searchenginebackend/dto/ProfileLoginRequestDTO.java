package com.example.searchenginebackend.dto;

import lombok.Data;

@Data
public class ProfileLoginRequestDTO {
    private Long profileId;
    private String password;
}
