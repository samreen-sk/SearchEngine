package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class QueryHistoryItemDTO {
    private Long id;
    private String queryText;
    private LocalDateTime searchedAt;
}
