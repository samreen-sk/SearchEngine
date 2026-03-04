package com.example.searchenginebackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExternalSearchService {

    @Value("${serper.api.key}")
    private String apiKey;

    @Value("${serper.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String search(String query) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-KEY", apiKey);

        Map<String, String> body = Map.of("q", query);

        HttpEntity<Map<String, String>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        apiUrl,
                        HttpMethod.POST,
                        request,
                        String.class
                );

        return response.getBody();
    }
}