package com.example.eventmgmt.dto;

import com.example.eventmgmt.model.enums.Role;

public record UserResponse(
        Long id,
        String username,
        String email,
        String fullName,
        Role role) {
}