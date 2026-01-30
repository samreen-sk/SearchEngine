package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.PageKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PageKeywordRepository extends JpaRepository<PageKeyword, Long> {

    // Find all keywords associated with a specific page (useful for displaying "Related Tags")
    List<PageKeyword> findByWebPageId(Long webPageId);

    // specific helper to find high-value matches (e.g., words in title)
    List<PageKeyword> findByKeywordWordAndInTitleTrue(String word);
}