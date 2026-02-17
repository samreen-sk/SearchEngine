package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.SearchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQuery, Long> {

    List<SearchQuery> findAllByProfileIdOrderBySearchedAtDesc(Long profileId);

    long countByProfileId(Long profileId);

    long deleteByQueryTextAndProfileId(String queryText, Long profileId);

    boolean existsByIdAndProfileId(Long id, Long profileId);

    // For Analytics: Find popular queries (simple grouping)
    @org.springframework.data.jpa.repository.Query(
            value = "SELECT query_text AS queryText, COUNT(*) AS cnt " +
                    "FROM search_queries " +
                    "WHERE profile_id = :profileId " +
                    "GROUP BY query_text " +
                    "ORDER BY cnt DESC " +
                    "LIMIT 10",
            nativeQuery = true
    )
    List<Object[]> findMostPopularQueries(@Param("profileId") Long profileId);
}
