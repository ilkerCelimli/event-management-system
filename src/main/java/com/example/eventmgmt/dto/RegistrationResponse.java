package com.example.eventmgmt.dto;

import com.example.eventmgmt.model.enums.RegistrationStatus;

import java.time.LocalDateTime;

public record RegistrationResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long userId,
        String username,
        RegistrationStatus status,
        LocalDateTime registeredAt) {
}