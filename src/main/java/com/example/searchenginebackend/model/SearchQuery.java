package com.example.searchenginebackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "search_queries",
        indexes = {
                @Index(name = "idx_query_text", columnList = "queryText"),
                @Index(name = "idx_query_time", columnList = "searchedAt")
        }
)
public class SearchQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_text", nullable = false, length = 512)
    private String queryText;

    @Column(name = "searched_at", nullable = false)
    private LocalDateTime searchedAt;

    public SearchQuery() {}

    public SearchQuery(String queryText) {
        this.queryText = queryText;
        this.searchedAt = LocalDateTime.now();
    }

    @PrePersist
    public void onSearch() {
        this.searchedAt = LocalDateTime.now();
    }

    // Getters and Setters
}
