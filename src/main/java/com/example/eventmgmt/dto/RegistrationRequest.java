package com.example.eventmgmt.dto;

import com.example.eventmgmt.model.enums.RegistrationStatus;
import jakarta.validation.constraints.NotNull;

public record RegistrationRequest(
        @NotNull(message = "Etkinlik ID zorunludur") Long eventId) {
}