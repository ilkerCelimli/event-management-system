package com.example.eventmgmt.dto;

import com.example.eventmgmt.model.enums.EventCategory;
import com.example.eventmgmt.model.enums.EventStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "Başlık zorunludur")
        @Size(max = 200, message = "Başlık en fazla 200 karakter olmalıdır")
        String title,

        @NotBlank(message = "Açıklama zorunludur")
        @Size(max = 2000, message = "Açıklama en fazla 2000 karakter olmalıdır")
        String description,

        @NotNull(message = "Kategori zorunludur")
        EventCategory category,

        EventStatus status,

        @Size(max = 150, message = "Mekan adı en fazla 150 karakter olmalıdır")
        String venueName,

        @Size(max = 300, message = "Adres en fazla 300 karakter olmalıdır")
        String address,

        @Size(max = 100, message = "Şehir en fazla 100 karakter olmalıdır")
        String city,

        @NotNull(message = "Başlangıç zamanı zorunludur")
        LocalDateTime startTime,

        @NotNull(message = "Bitiş zamanı zorunludur")
        LocalDateTime endTime,

        @NotNull(message = "Kapasite zorunludur")
        @Min(value = 1, message = "Kapasite en az 1 olmalıdır")
        Integer capacity) {
}