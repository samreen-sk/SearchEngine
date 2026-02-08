package com.example.searchenginebackend.service;

import com.example.searchenginebackend.dto.SearchResponseDTO;
import com.example.searchenginebackend.exception.BadRequestException;
import com.example.searchenginebackend.model.SearchQuery;
import com.example.searchenginebackend.model.SearchResult;
import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.SearchQueryRepository;
import com.example.searchenginebackend.repository.SearchResultRepository;
import com.example.searchenginebackend.repository.WebPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final SerperSearchService serperSearchService;
    private final SearchQueryRepository searchQueryRepository;
    private final SearchResultRepository searchResultRepository;
    private final WebPageRepository webPageRepository;
    private final IndexingService indexingService;

    public List<SearchResponseDTO> search(String query, Pageable pageable) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isBlank()) {
            throw new BadRequestException("Query cannot be empty");
        }

        SearchQuery searchQuery =
                searchQueryRepository.save(new SearchQuery(normalizedQuery));

        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        List<SerperSearchService.SerperResult> results =
                serperSearchService.search(normalizedQuery, page + 1, size);

        List<SearchResponseDTO> response = new ArrayList<>();
        int rank = page * size + 1;
        for (SerperSearchService.SerperResult result : results) {
            String title = result.title() == null || result.title().isBlank()
                    ? result.link()
                    : result.title();
            String snippet = result.snippet() == null ? "" : result.snippet();
            String document = (title + " " + snippet).trim();

            WebPage pageEntity = upsertWebPage(result.link(), title, document);
            double cosine = cosineSimilarity(normalizedQuery, document);
            double relevance = 1.0 / rank;

            SearchResult searchResult = new SearchResult();
            searchResult.setSearchQuery(searchQuery);
            searchResult.setWebPage(pageEntity);
            searchResult.setQueryText(normalizedQuery);
            searchResult.setRank(rank);
            searchResult.setCosineSimilarity(cosine);
            searchResult.setRelevanceScore(relevance);
            searchResultRepository.save(searchResult);

            response.add(new SearchResponseDTO(
                    pageEntity.getId(),
                    result.link(),
                    title,
                    relevance,
                    rank
            ));
            rank++;
        }

        return response;
    }

    private WebPage upsertWebPage(String url, String title, String content) {
        Optional<WebPage> existing = webPageRepository.findByUrl(url);
        if (existing.isPresent()) {
            WebPage page = existing.get();
            boolean updated = false;
            if (page.getTitle() == null || page.getTitle().isBlank()) {
                page.setTitle(title);
                updated = true;
            }
            if (page.getContent() == null || page.getContent().isBlank()) {
                page.setContent(content);
                updated = true;
            }
            if (updated) {
                WebPage saved = webPageRepository.save(page);
                indexingService.indexPage(saved);
                return saved;
            }
            return page;
        }

        WebPage page = new WebPage();
        page.setUrl(url);
        page.setTitle(title);
        page.setContent(content);
        WebPage saved = webPageRepository.save(page);
        indexingService.indexPage(saved);
        return saved;
    }

    private double cosineSimilarity(String query, String document) {
        Map<String, Integer> q = termFrequency(query);
        Map<String, Integer> d = termFrequency(document);
        if (q.isEmpty() || d.isEmpty()) {
            return 0.0;
        }

        double dot = 0.0;
        double normQ = 0.0;
        double normD = 0.0;

        for (int v : q.values()) {
            normQ += (double) v * v;
        }
        for (int v : d.values()) {
            normD += (double) v * v;
        }

        for (Map.Entry<String, Integer> entry : q.entrySet()) {
            Integer dv = d.get(entry.getKey());
            if (dv != null) {
                dot += (double) entry.getValue() * dv;
            }
        }

        if (normQ == 0.0 || normD == 0.0) {
            return 0.0;
        }
        return dot / (Math.sqrt(normQ) * Math.sqrt(normD));
    }

    private Map<String, Integer> termFrequency(String text) {
        Map<String, Integer> frequencyMap = new HashMap<>();
        if (text == null || text.isBlank()) {
            return frequencyMap;
        }
        String[] words = text.toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .split("\\s+");
        for (String word : words) {
            if (word.length() < 2) {
                continue;
            }
            frequencyMap.put(word, frequencyMap.getOrDefault(word, 0) + 1);
        }
        return frequencyMap;
    }
}
