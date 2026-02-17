package com.example.searchenginebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "search_queries",
        indexes = {
                @Index(name = "idx_query_text", columnList = "queryText"),
                @Index(name = "idx_query_time", columnList = "searchedAt")
        }
)
@Data
@NoArgsConstructor
public class SearchQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_text", nullable = false, length = 512)
    private String queryText;

    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "searched_at", nullable = false)
    private LocalDateTime searchedAt;

    public SearchQuery(String queryText, Long profileId) {
        this.queryText = queryText;
        this.profileId = profileId;
        this.searchedAt = LocalDateTime.now();
    }

    @PrePersist
    public void onSearch() {
        this.searchedAt = LocalDateTime.now();
    }
}
