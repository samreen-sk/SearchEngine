package com.example.searchenginebackend.repository;

import com.example.searchenginebackend.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    List<Profile> findAllByOrderByCreatedAtDesc();
}
