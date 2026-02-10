package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopQueryDTO {
    private String query;
    private long count;
}
