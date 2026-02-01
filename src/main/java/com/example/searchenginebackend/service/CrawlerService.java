package com.example.searchenginebackend.service;

import com.example.searchenginebackend.model.WebPage;
import com.example.searchenginebackend.repository.WebPageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrawlerService {

    private final WebPageRepository webPageRepository;
    private final IndexingService indexingService;

    @Transactional
    public WebPage crawl(String url, String title, String content) {

        if (webPageRepository.existsByUrl(url)) {
            return webPageRepository.findByUrl(url).get();
        }

        WebPage page = new WebPage();
        page.setUrl(url);
        page.setTitle(title);
        page.setContent(content);

        WebPage savedPage = webPageRepository.save(page);
        indexingService.indexPage(savedPage);

        return savedPage;
    }
}
