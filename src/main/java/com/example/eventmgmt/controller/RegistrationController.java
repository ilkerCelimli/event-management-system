package com.example.eventmgmt.controller;

import com.example.eventmgmt.dto.RegistrationRequest;
import com.example.eventmgmt.dto.RegistrationResponse;
import com.example.eventmgmt.exception.UnauthorizedException;
import com.example.eventmgmt.security.JwtAuthFilter;
import com.example.eventmgmt.service.RegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request,
                                                         HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.register(requireUserId(httpRequest), request.eventId()));
    }

    @GetMapping("/me")
    public List<RegistrationResponse> myRegistrations(HttpServletRequest httpRequest) {
        return registrationService.listMyRegistrations(requireUserId(httpRequest));
    }

    @GetMapping("/event/{eventId}")
    public List<RegistrationResponse> byEvent(@PathVariable Long eventId, HttpServletRequest httpRequest) {
        return registrationService.listByEvent(eventId, requireUserId(httpRequest));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> cancel(@PathVariable Long eventId, HttpServletRequest httpRequest) {
        registrationService.cancel(requireUserId(httpRequest), eventId);
        return ResponseEntity.noContent().build();
    }

    private Long requireUserId(HttpServletRequest request) {
        Object value = request.getAttribute(JwtAuthFilter.CURRENT_USER_ID_ATTR);
        if (!(value instanceof Long)) {
            throw new UnauthorizedException("Kimlik doğrulama gerekli");
        }
        return (Long) value;
    }
}