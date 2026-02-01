package com.example.searchenginebackend.service;

import org.springframework.stereotype.Service;

@Service
public class RankingService {

    public double calculateScore(int frequency, boolean inTitle, int rank) {

        double score = frequency;

        if (inTitle) {
            score += 10;
        }

        score += (1.0 / rank);
        return score;
    }
}
