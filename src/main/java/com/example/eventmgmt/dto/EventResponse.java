package com.example.eventmgmt.dto;

import com.example.eventmgmt.model.enums.EventCategory;
import com.example.eventmgmt.model.enums.EventStatus;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String description,
        EventCategory category,
        EventStatus status,
        String venueName,
        String address,
        String city,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer capacity,
        Long organizerId,
        String organizerName,
        long registeredCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}