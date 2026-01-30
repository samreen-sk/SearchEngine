package com.example.searchenginebackend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(
        name = "keywords",
        indexes = {
                @Index(name = "idx_keyword_word", columnList = "word", unique = true)
        }
)
public class Keyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String word;

    @OneToMany(mappedBy = "keyword", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PageKeyword> pageKeywords;

    public Keyword() {
    }

    public Keyword(String word) {
        this.word = word;
    }

// Getters and Setters

}
