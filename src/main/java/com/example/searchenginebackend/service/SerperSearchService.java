package com.example.searchenginebackend.service;

import com.example.searchenginebackend.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SerperSearchService {

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(REQUEST_TIMEOUT)
            .build();

    @Value("${serper.api.key:}")
    private String apiKey;

    @Value("${serper.api.base-url:https://google.serper.dev}")
    private String baseUrl;

    public List<SerperResult> search(String query, int page, int size) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Serper API key is missing. Configure 'serper.api.key'.");
        }

        int safePage = Math.max(1, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        String payload = "{\"q\":\"" + escapeJson(query) + "\"," +
                "\"page\":" + safePage + "," +
                "\"num\":" + safeSize + "}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/search"))
                .timeout(REQUEST_TIMEOUT)
                .header("X-API-KEY", apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BadRequestException(
                        "Serper search failed with status " + response.statusCode()
                );
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode organic = root.path("organic");
            List<SerperResult> results = new ArrayList<>();

            if (organic.isArray()) {
                for (JsonNode item : organic) {
                    String link = item.path("link").asText("");
                    if (link.isBlank()) {
                        continue;
                    }
                    String title = item.path("title").asText("");
                    String snippet = item.path("snippet").asText("");
                    results.add(new SerperResult(title, link, snippet));
                }
            }

            return results;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Serper search failed: " + e.getMessage());
        } catch (IOException e) {
            throw new BadRequestException("Serper search failed: " + e.getMessage());
        }
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    public record SerperResult(String title, String link, String snippet) {
    }
}
