package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Long> {

    // Essential for IndexingService to ensure we don't create duplicate keywords
    Optional<Keyword> findByWord(String word);
}