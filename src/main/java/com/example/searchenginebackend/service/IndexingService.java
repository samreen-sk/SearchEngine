package com.example.searchenginebackend.service;

import com.example.searchenginebackend.model.Keyword;
import com.example.searchenginebackend.model.PageKeyword;
import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.KeywordRepository;
import com.example.searchenginebackend.repository.PageKeywordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class IndexingService {

    private final KeywordRepository keywordRepository;
    private final PageKeywordRepository pageKeywordRepository;
    private final KeywordExtractionService keywordExtractionService;

    @Transactional
    public void indexPage(WebPage page) {

        Map<String, Integer> keywords =
                keywordExtractionService.extractKeywords(page.getContent());

        for (Map.Entry<String, Integer> entry : keywords.entrySet()) {

            Keyword keyword = findOrCreateKeyword(entry.getKey());

            PageKeyword pageKeyword = new PageKeyword();
            pageKeyword.setWebPage(page);
            pageKeyword.setKeyword(keyword);
            pageKeyword.setKeywordWord(keyword.getWord());
            pageKeyword.setFrequency(entry.getValue());
            pageKeyword.setInTitle(
                    page.getTitle().toLowerCase().contains(entry.getKey())
            );

            pageKeywordRepository.save(pageKeyword);
        }
    }

    private Keyword findOrCreateKeyword(String word) {
        return keywordRepository.findByWord(word).orElseGet(() -> {
            try {
                return keywordRepository.save(new Keyword(word));
            } catch (DataIntegrityViolationException duplicateInsert) {
                // Another transaction inserted the same keyword concurrently.
                return keywordRepository.findByWord(word)
                        .orElseThrow(() -> duplicateInsert);
            }
        });
    }
}
