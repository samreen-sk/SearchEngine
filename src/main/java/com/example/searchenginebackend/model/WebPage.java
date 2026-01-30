package com.example.searchenginebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(
        name = "web_pages",
        indexes = {
                @Index(name = "idx_webpage_url", columnList = "url", unique = true),
                @Index(name = "idx_webpage_title", columnList = "title")
        }
)
public class WebPage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 2048)
    private String url;

    @Column(nullable = false, length = 512)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "crawl_time", nullable = false)
    private LocalDateTime crawlTime;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "webPage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PageKeyword> pageKeywords;

    @PrePersist
    public void onCreate() {
        this.crawlTime = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters

}
