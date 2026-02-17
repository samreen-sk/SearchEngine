package com.example.searchenginebackend.security;

import com.example.searchenginebackend.exception.BadRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public Long currentProfileId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedProfile principal)) {
            throw new BadRequestException("Unauthorized profile session");
        }
        return principal.profileId();
    }
}
