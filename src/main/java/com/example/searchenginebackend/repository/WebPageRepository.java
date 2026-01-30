package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.WebPage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebPageRepository extends JpaRepository<WebPage, Long> {

    // Used by CrawlerService to check if a URL has already been visited
    Optional<WebPage> findByUrl(String url);

    // Used by CrawlerService to check if a URL exists (lighter than fetching the whole object)
    boolean existsByUrl(String url);

    // This finds pages containing the keyword, joins tables, and sorts by
    // relevance (frequency).
    // Returns a 'Page<WebPage>' to support your Incremental Scrolling.

    @Query("SELECT wp FROM WebPage wp " +
            "JOIN wp.pageKeywords pk " +
            "JOIN pk.keyword k " +
            "WHERE k.word = :word " +
            "ORDER BY pk.frequency DESC, pk.inTitle DESC")
    Page<WebPage> findByKeyword(@Param("word") String word, Pageable pageable);

    // Alternative: Simple text search on title if no keywords found
    Page<WebPage> findByTitleContainingIgnoreCase(String titlePart, Pageable pageable);
}