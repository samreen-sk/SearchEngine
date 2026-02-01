package com.example.searchenginebackend.config;

import com.example.searchenginebackend.model.*;
import com.example.searchenginebackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder {

    private final WebPageRepository webPageRepo;
    private final KeywordRepository keywordRepo;
    private final PageKeywordRepository pageKeywordRepo;
    private final SearchQueryRepository searchQueryRepo;
    private final SearchResultRepository searchResultRepo;

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            System.out.println("--- CHECKING DATABASE STATE ---");

            String url = "https://react.dev";
            String keywordVal = "react";

            // 1. Check if Page Exists
            if (webPageRepo.findByUrl(url).isPresent()) {
                System.out.println("⚠️ Data already exists. Skipping seeding.");
                return;
            }

            // 2. Create WebPage
            WebPage page1 = new WebPage();
            page1.setUrl(url);
            page1.setTitle("React - The Library for Web and Native User Interfaces");
            page1.setContent("React lets you build user interfaces out of individual pieces called components.");
            page1.setLastUpdated(LocalDateTime.now());
            page1.setCrawlTime(LocalDateTime.now());
            webPageRepo.save(page1);

            // 3. Create Keyword (Check if exists first to be safe)
            Keyword key1 = keywordRepo.findByWord(keywordVal)
                    .orElseGet(() -> {
                        Keyword k = new Keyword(keywordVal);
                        return keywordRepo.save(k);
                    });

            // 4. Link Page and Keyword
            PageKeyword link = new PageKeyword();
            link.setWebPage(page1);
            link.setKeyword(key1);
            link.setFrequency(10);
            link.setInTitle(true);
            pageKeywordRepo.save(link);

            // 5. Create Dummy Analytics Data
            SearchQuery userQuery = new SearchQuery(keywordVal);
            searchQueryRepo.save(userQuery);

            SearchResult resultLog = new SearchResult();
            resultLog.setSearchQuery(userQuery);
            resultLog.setWebPage(page1);
            resultLog.setScore(1.0);
            resultLog.setRank(1);
            searchResultRepo.save(resultLog);

            System.out.println("✅ Database Seeded Successfully");
        };
    }
}