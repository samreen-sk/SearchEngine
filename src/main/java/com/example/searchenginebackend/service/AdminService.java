package com.example.searchenginebackend.service;

import com.example.searchenginebackend.dto.AdminProfileDataDTO;
import com.example.searchenginebackend.dto.ProfileResponseDTO;
import com.example.searchenginebackend.dto.QueryHistoryItemDTO;
import com.example.searchenginebackend.dto.SearchResponseDTO;
import com.example.searchenginebackend.dto.TopQueryDTO;
import com.example.searchenginebackend.exception.ResourceNotFoundException;
import com.example.searchenginebackend.model.SearchQuery;
import com.example.searchenginebackend.model.SearchResult;
import com.example.searchenginebackend.repository.ProfileRepository;
import com.example.searchenginebackend.repository.SearchQueryRepository;
import com.example.searchenginebackend.repository.SearchResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProfileRepository profileRepository;
    private final SearchQueryRepository searchQueryRepository;
    private final SearchResultRepository searchResultRepository;

    public AdminProfileDataDTO getProfileData(Long profileId) {
        var profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        ProfileResponseDTO profileResponse = new ProfileResponseDTO(
                profile.getId(),
                profile.getDisplayName(),
                profile.getCreatedAt()
        );

        List<QueryHistoryItemDTO> history = searchQueryRepository
                .findAllByProfileIdOrderBySearchedAtDesc(profileId)
                .stream()
                .map(this::toHistoryItem)
                .toList();

        List<TopQueryDTO> topQueries = searchQueryRepository
                .findMostPopularQueries(profileId)
                .stream()
                .map(this::toTopQuery)
                .toList();

        List<SearchResponseDTO> storedResults = searchResultRepository
                .findTop100BySearchQueryProfileIdOrderByCreatedAtDesc(profileId)
                .stream()
                .map(this::toSearchResponse)
                .toList();

        long totalQueries = searchQueryRepository.countByProfileId(profileId);
        long totalResults = searchResultRepository.countBySearchQueryProfileId(profileId);

        return new AdminProfileDataDTO(
                profileResponse,
                totalQueries,
                totalResults,
                history,
                topQueries,
                storedResults
        );
    }

    private QueryHistoryItemDTO toHistoryItem(SearchQuery query) {
        return new QueryHistoryItemDTO(
                query.getId(),
                query.getQueryText(),
                query.getSearchedAt()
        );
    }

    private TopQueryDTO toTopQuery(Object[] row) {
        String query = String.valueOf(row[0]);
        long count = ((Number) row[1]).longValue();
        return new TopQueryDTO(query, count);
    }

    private SearchResponseDTO toSearchResponse(SearchResult result) {
        return new SearchResponseDTO(
                result.getId(),
                result.getWebPage().getId(),
                result.getWebPage().getUrl(),
                result.getWebPage().getTitle(),
                result.getRelevanceScore(),
                result.getRank()
        );
    }
}
