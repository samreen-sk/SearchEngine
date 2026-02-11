package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.SearchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQuery, Long> {

    // For Analytics: Get the most recent searches
    List<SearchQuery> findTop10ByOrderBySearchedAtDesc();

    List<SearchQuery> findAllByOrderBySearchedAtDesc();

    List<SearchQuery> findTop10ByQueryTextOrderBySearchedAtDesc(String queryText);

    long deleteByQueryText(String queryText);

    // For Analytics: Find popular queries (simple grouping)
    @org.springframework.data.jpa.repository.Query(
            value = "SELECT query_text AS queryText, COUNT(*) AS cnt " +
                    "FROM search_queries " +
                    "GROUP BY query_text " +
                    "ORDER BY cnt DESC " +
                    "LIMIT 10",
            nativeQuery = true
    )
    List<Object[]> findMostPopularQueries();
}
