package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.TrendingQueryDTO;
import com.example.searchenginebackend.model.SearchQuery;
import com.example.searchenginebackend.repository.SearchQueryRepository;
import com.example.searchenginebackend.service.TrendingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SearchQueryRepository searchQueryRepository;
    private final TrendingService trendingService;

    @GetMapping("/recent-searches")
    public List<SearchQuery> recentSearches() {
        return searchQueryRepository.findTop10ByOrderBySearchedAtDesc();
    }

    @GetMapping("/trending")
    public List<TrendingQueryDTO> trendingSearches() {
        return trendingService.getTrendingQueries();
    }
}
