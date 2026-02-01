package com.example.searchenginebackend.config;

import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.WebPageRepository;
import com.example.searchenginebackend.service.IndexingService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final WebPageRepository webPageRepository;
    private final IndexingService indexingService;

    @Override
    public void run(String... args) {

        if (webPageRepository.count() > 0) {
            return; // prevent duplicate seeding
        }

        WebPage page = new WebPage();
        page.setUrl("https://example.com");
        page.setTitle("Example Search Engine Page");
        page.setContent(
                "This is a sample page used to seed the search engine backend."
        );

        WebPage saved = webPageRepository.save(page);
        indexingService.indexPage(saved);
    }
}
