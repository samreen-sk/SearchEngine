package com.example.searchenginebackend.dto;

import lombok.Data;

@Data
public class CrawlRequest {

    private String url;
    private String title;
    private String content;
}
