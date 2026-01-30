package com.example.searchenginebackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "search_results",
        indexes = {
                @Index(name = "idx_result_score", columnList = "score")
        }
)
public class SearchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "query_id", nullable = false)
    private SearchQuery searchQuery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "web_page_id", nullable = false)
    private WebPage webPage;

    @Column(nullable = false)
    private double score;

    @Column(name = "result_rank", nullable = false)
    private int rank;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public SearchResult() {}

    // Getters and Setters
}
