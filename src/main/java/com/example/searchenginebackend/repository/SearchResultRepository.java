package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.SearchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface SearchResultRepository extends JpaRepository<SearchResult, Long> {

    // Retrieve the results logged for a specific query session
    List<SearchResult> findBySearchQueryIdOrderByRankAsc(Long searchQueryId);

    List<SearchResult> findByQueryTextOrderByRankAsc(String queryText);

    long deleteByQueryText(String queryText);

    @Modifying
    @Query("DELETE FROM SearchResult r WHERE r.searchQuery.id = :searchQueryId")
    int deleteBySearchQueryId(@Param("searchQueryId") Long searchQueryId);
}
