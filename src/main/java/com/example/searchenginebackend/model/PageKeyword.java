package com.example.searchenginebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(
        name = "page_keywords",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"web_page_id", "keyword_id"})
        },
        indexes = {
                @Index(name = "idx_pagekeyword_frequency", columnList = "frequency")
        }
)
public class PageKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "web_page_id", nullable = false)
    private WebPage webPage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyword_id", nullable = false)
    private Keyword keyword;

    @Column(nullable = false)
    private int frequency;

    @Column(name = "is_in_title", nullable = false)
    private boolean inTitle;

    // Getters and Setters
}
