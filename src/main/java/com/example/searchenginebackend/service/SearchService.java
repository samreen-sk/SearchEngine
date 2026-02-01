package com.example.searchenginebackend.service;

import com.example.searchenginebackend.model.SearchQuery;
import com.example.searchenginebackend.model.SearchResult;
import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.SearchQueryRepository;
import com.example.searchenginebackend.repository.SearchResultRepository;
import com.example.searchenginebackend.repository.WebPageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final WebPageRepository webPageRepository;
    private final SearchQueryRepository searchQueryRepository;
    private final SearchResultRepository searchResultRepository;
    private final RankingService rankingService;

    @Transactional
    public Page<WebPage> search(String query, Pageable pageable) {

        SearchQuery searchQuery =
                searchQueryRepository.save(new SearchQuery(query));

        Page<WebPage> pages =
                webPageRepository.findByKeyword(query, pageable);

        if (pages.isEmpty()) {
            pages = webPageRepository
                    .findByTitleContainingIgnoreCase(query, pageable);
        }

        int rank = 1;
        for (WebPage page : pages) {

            SearchResult result = new SearchResult();
            result.setSearchQuery(searchQuery);
            result.setWebPage(page);
            result.setRank(rank);
            result.setScore(
                    rankingService.calculateScore(1, true, rank)
            );

            searchResultRepository.save(result);
            rank++;
        }

        return pages;
    }
}
