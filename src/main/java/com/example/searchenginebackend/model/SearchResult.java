package com.example.searchenginebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "search_results",
        indexes = {
                @Index(name = "idx_result_relevance", columnList = "relevance_score"),
                @Index(name = "idx_result_cosine", columnList = "cosine_similarity")
        }
)
@Data
@NoArgsConstructor
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

    @Column(name = "query_text", nullable = false, length = 512)
    private String queryText;

    @Column(name = "cosine_similarity", nullable = false)
    private double cosineSimilarity;

    @Column(name = "relevance_score", nullable = false)
    private double relevanceScore;

    @Column(name = "result_rank", nullable = false)
    private int rank;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
