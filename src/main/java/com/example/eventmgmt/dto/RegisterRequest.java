package com.example.eventmgmt.dto;

import com.example.eventmgmt.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Kullanıcı adı zorunludur")
        @Size(min = 3, max = 50, message = "Kullanıcı adı 3-50 karakter olmalıdır")
        String username,

        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta giriniz")
        String email,

        @NotBlank(message = "Şifre zorunludur")
        @Size(min = 6, max = 100, message = "Şifre en az 6 karakter olmalıdır")
        String password,

        @NotBlank(message = "Ad soyad zorunludur")
        @Size(max = 120, message = "Ad soyad en fazla 120 karakter olmalıdır")
        String fullName,

        Role role) {
}