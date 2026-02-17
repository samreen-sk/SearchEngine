package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.SearchRequestDTO;
import com.example.searchenginebackend.dto.SearchResponseDTO;
import com.example.searchenginebackend.dto.TopQueryDTO;
import com.example.searchenginebackend.dto.UpdateSearchResultDTO;
import com.example.searchenginebackend.model.SearchQuery;
import com.example.searchenginebackend.model.SearchResult;
import com.example.searchenginebackend.security.SecurityUtil;
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
    private final SecurityUtil securityUtil;

    @PostMapping
    public List<SearchResponseDTO> search(
            @RequestBody SearchRequestDTO request) {
        Long profileId = securityUtil.currentProfileId();

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize()
        );

        return searchService.search(request.getQuery(), pageable, profileId);
    }

    @GetMapping("/history")
    public List<SearchQuery> history() {
        Long profileId = securityUtil.currentProfileId();
        return searchService.getRecentQueries(profileId);
    }

    @GetMapping("/top")
    public List<TopQueryDTO> topQueries() {
        Long profileId = securityUtil.currentProfileId();
        return searchService.getTopQueries(profileId);
    }

    @GetMapping("/results")
    public List<SearchResponseDTO> resultsByQuery(
            @RequestParam("query") String query) {
        Long profileId = securityUtil.currentProfileId();
        return searchService.getStoredResults(query, profileId);
    }

    @PutMapping("/results/{id}")
    public SearchResult updateResult(
            @PathVariable Long id,
            @RequestBody UpdateSearchResultDTO request) {
        Long profileId = securityUtil.currentProfileId();
        return searchService.updateResult(id, profileId, request);
    }

    @DeleteMapping("/results/{id}")
    public void deleteResult(@PathVariable Long id) {
        Long profileId = securityUtil.currentProfileId();
        searchService.deleteResult(id, profileId);
    }

    @DeleteMapping("/results")
    public long deleteResultsByQuery(
            @RequestParam("query") String query) {
        Long profileId = securityUtil.currentProfileId();
        return searchService.deleteResultsByQuery(query, profileId);
    }

    @DeleteMapping("/history/{id}")
    public void deleteHistoryById(@PathVariable Long id) {
        Long profileId = securityUtil.currentProfileId();
        searchService.deleteQueryById(id, profileId);
    }

    @DeleteMapping("/history")
    public long deleteHistoryByQuery(@RequestParam("query") String query) {
        Long profileId = securityUtil.currentProfileId();
        return searchService.deleteQueryByText(query, profileId);
    }
}
