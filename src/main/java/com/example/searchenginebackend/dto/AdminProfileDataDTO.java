package com.example.searchenginebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AdminProfileDataDTO {
    private ProfileResponseDTO profile;
    private long totalQueries;
    private long totalResults;
    private List<QueryHistoryItemDTO> history;
    private List<TopQueryDTO> topQueries;
    private List<SearchResponseDTO> storedResults;
}
