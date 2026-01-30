package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.SearchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQuery, Long> {

    // For Analytics: Get the most recent searches
    List<SearchQuery> findTop10ByOrderBySearchedAtDesc();

    // For Analytics: Find popular queries (simple grouping)
    @Query("SELECT sq.queryText, COUNT(sq) as cnt " +
            "FROM SearchQuery sq " +
            "GROUP BY sq.queryText " +
            "ORDER BY cnt DESC " +
            "LIMIT 10")
    List<Object[]> findMostPopularQueries();
}