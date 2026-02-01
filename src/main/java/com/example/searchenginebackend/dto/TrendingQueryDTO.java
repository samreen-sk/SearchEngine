package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TrendingQueryDTO {

    private String query;
    private long count;
}
