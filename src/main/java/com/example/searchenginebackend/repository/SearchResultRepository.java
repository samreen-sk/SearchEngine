package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.SearchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchResultRepository extends JpaRepository<SearchResult, Long> {

    // Retrieve the results logged for a specific query session
    List<SearchResult> findBySearchQueryIdOrderByRankAsc(Long searchQueryId);
}