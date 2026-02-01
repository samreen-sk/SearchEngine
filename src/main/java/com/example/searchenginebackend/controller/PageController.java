package com.example.searchenginebackend.controller;

import com.example.searchenginebackend.dto.CrawlRequest;
import com.example.searchenginebackend.dto.CrawlResponseDTO;
import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.service.CrawlerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {

    private final CrawlerService crawlerService;

    @PostMapping("/crawl")
    public CrawlResponseDTO crawlPage(@RequestBody CrawlRequest request) {

        WebPage page = crawlerService.crawl(
                request.getUrl(),
                request.getTitle(),
                request.getContent()
        );

        return new CrawlResponseDTO(
                page.getId(),
                page.getUrl(),
                "Page crawled and indexed successfully"
        );
    }
}
