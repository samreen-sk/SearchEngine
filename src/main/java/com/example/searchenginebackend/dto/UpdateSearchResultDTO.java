package com.example.searchenginebackend.dto;

import lombok.Data;

@Data
public class UpdateSearchResultDTO {
    private Integer rank;
    private Double relevanceScore;
    private Double cosineSimilarity;
}
