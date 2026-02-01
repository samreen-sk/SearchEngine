package com.example.searchenginebackend.dto;

import lombok.Data;

@Data
public class SearchRequestDTO {

    private String query;
    private int page = 0;
    private int size = 10;
}
