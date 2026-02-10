package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.SearchRequestDTO;
import com.example.searchenginebackend.dto.SearchResponseDTO;
import com.example.searchenginebackend.dto.TopQueryDTO;
import com.example.searchenginebackend.model.SearchQuery;
import com.example.searchenginebackend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping
    public List<SearchResponseDTO> search(@RequestBody SearchRequestDTO request) {

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize()
        );

        return searchService.search(request.getQuery(), pageable);
    }

    @GetMapping("/history")
    public List<SearchQuery> history() {
        return searchService.getRecentQueries();
    }

    @GetMapping("/top")
    public List<TopQueryDTO> topQueries() {
        return searchService.getTopQueries();
    }

    @GetMapping("/results")
    public List<SearchResponseDTO> resultsByQuery(@RequestParam("query") String query) {
        return searchService.getStoredResults(query);
    }
}
