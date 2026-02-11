package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SearchResponseDTO {

    private Long resultId;
    private Long pageId;
    private String url;
    private String title;
    private double score;
    private int rank;
}
