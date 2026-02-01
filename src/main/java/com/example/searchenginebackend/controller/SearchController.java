package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.SearchRequestDTO;
import com.example.searchenginebackend.dto.SearchResponseDTO;
import com.example.searchenginebackend.model.SearchResult;
import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.SearchResultRepository;
import com.example.searchenginebackend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final SearchResultRepository searchResultRepository;

    @PostMapping
    public List<SearchResponseDTO> search(@RequestBody SearchRequestDTO request) {

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize()
        );

        Page<WebPage> pages =
                searchService.search(request.getQuery(), pageable);

        // Fetch stored ranked results
        List<SearchResult> results =
                searchResultRepository.findBySearchQueryIdOrderByRankAsc(
                        searchResultRepository.findAll()
                                .get(searchResultRepository.findAll().size() - 1)
                                .getSearchQuery()
                                .getId()
                );

        return results.stream()
                .map(r -> new SearchResponseDTO(
                        r.getWebPage().getId(),
                        r.getWebPage().getUrl(),
                        r.getWebPage().getTitle(),
                        r.getScore(),
                        r.getRank()
                ))
                .collect(Collectors.toList());
    }
}
