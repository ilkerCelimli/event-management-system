package com.example.eventmgmt.security;

import com.example.eventmgmt.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Reads the "Authorization: Bearer <token>" header, validates the JWT and stores
 * the resolved {@code currentUserId} as a request attribute. Invalid or missing
 * tokens simply leave the attribute unset; protected endpoints reject the call.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String CURRENT_USER_ID_ATTR = "currentUserId";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public Long resolveUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new UnauthorizedException("Authorization header eksik veya hatalı");
        }
        String token = header.substring(BEARER_PREFIX.length());
        Claims claims = jwtUtil.parseToken(token);
        return Long.valueOf(claims.getSubject());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            request.setAttribute(CURRENT_USER_ID_ATTR, resolveUserId(request));
        } catch (UnauthorizedException | JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}