package com.example.searchenginebackend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class KeywordExtractionService {

    public Map<String, Integer> extractKeywords(String text) {
        Map<String, Integer> frequencyMap = new HashMap<>();

        if (text == null || text.isBlank()) {
            return frequencyMap;
        }

        String[] words = text.toLowerCase()
                .replaceAll("[^a-z0-9 ]", "")
                .split("\\s+");

        for (String word : words) {
            if (word.length() < 3) continue;
            frequencyMap.put(word, frequencyMap.getOrDefault(word, 0) + 1);
        }

        return frequencyMap;
    }
}
