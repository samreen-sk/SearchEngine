package com.example.searchenginebackend.service;

import com.example.searchenginebackend.dto.TrendingQueryDTO;
import com.example.searchenginebackend.repository.SearchQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrendingService {

    private final SearchQueryRepository searchQueryRepository;

    public List<TrendingQueryDTO> getTrendingQueries() {

        return searchQueryRepository.findMostPopularQueries()
                .stream()
                .map(obj -> new TrendingQueryDTO(
                        (String) obj[0],
                        ((Number) obj[1]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
