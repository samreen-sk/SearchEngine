package com.example.searchenginebackend.config;

import com.example.searchenginebackend.model.Keyword;
import com.example.searchenginebackend.model.PageKeyword;
import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.KeywordRepository;
import com.example.searchenginebackend.repository.PageKeywordRepository;
import com.example.searchenginebackend.repository.WebPageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Configuration
public class DatabaseSeeder {

    CommandLineRunner initDatabase(WebPageRepository webPageRepo,
                                   KeywordRepository keywordRepo,
                                   PageKeywordRepository pageKeywordRepo) {
        return args -> {
            System.out.println("--- STARTING DATABASE INTEGRATION TEST ---");

            // 1. Create a WebPage
            WebPage page1 = new WebPage();
            page1.setUrl("https://react.dev");
            page1.setTitle("React - The Library for Web and Native User Interfaces");
            page1.setContent("React lets you build user interfaces out of individual pieces called components.");
            page1.setLastUpdated(LocalDateTime.now());
            page1.setCrawlTime(LocalDateTime.now());

            // Save Page
            webPageRepo.save(page1);
            System.out.println("WebPage Saved: " + page1.getUrl());

            // 2. Create a Keyword
            Keyword key1 = new Keyword("react");
            keywordRepo.save(key1);
            System.out.println("Keyword Saved: " + key1.getWord());

            // 3. Link them (PageKeyword)
            PageKeyword link = new PageKeyword();
            link.setWebPage(page1);
            link.setKeyword(key1);
            link.setFrequency(10);
            link.setInTitle(true);

            pageKeywordRepo.save(link);
            System.out.println("Linked Page and Keyword");

            // 4. TEST THE SEARCH QUERY (The one used for Incremental Scroll)
            System.out.println("--- TESTING REPOSITORY QUERY ---");

            Page<WebPage> results = webPageRepo.findByKeyword("react", PageRequest.of(0, 10));

            if (results.hasContent()) {
                System.out.println("SUCCESS! Found " + results.getTotalElements() + " page(s) for keyword 'react'.");
                System.out.println(" Title: " + results.getContent().get(0).getTitle());
            } else {
                System.out.println("FAILURE: Repository query returned no results.");
            }

            System.out.println("--- TEST COMPLETE ---");
        };
    }
}