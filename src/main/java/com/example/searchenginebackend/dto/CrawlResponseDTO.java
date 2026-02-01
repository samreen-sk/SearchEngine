package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CrawlResponseDTO {

    private Long pageId;
    private String url;
    private String message;
}
