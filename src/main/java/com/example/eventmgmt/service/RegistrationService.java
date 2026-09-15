package com.example.eventmgmt.service;

import com.example.eventmgmt.dto.RegistrationResponse;
import com.example.eventmgmt.exception.ConflictException;
import com.example.eventmgmt.exception.NotFoundException;
import com.example.eventmgmt.exception.UnauthorizedException;
import com.example.eventmgmt.model.entity.Event;
import com.example.eventmgmt.model.entity.Registration;
import com.example.eventmgmt.model.entity.User;
import com.example.eventmgmt.model.enums.EventStatus;
import com.example.eventmgmt.model.enums.RegistrationStatus;
import com.example.eventmgmt.model.enums.Role;
import com.example.eventmgmt.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventService eventService;
    private final AuthService authService;

    public RegistrationService(RegistrationRepository registrationRepository,
                               EventService eventService,
                               AuthService authService) {
        this.registrationRepository = registrationRepository;
        this.eventService = eventService;
        this.authService = authService;
    }

    public RegistrationResponse toResponse(Registration r) {
        return new RegistrationResponse(
                r.getId(),
                r.getEvent().getId(),
                r.getEvent().getTitle(),
                r.getUser().getId(),
                r.getUser().getUsername(),
                r.getStatus(),
                r.getRegisteredAt());
    }

    @Transactional
    public RegistrationResponse register(Long currentUserId, Long eventId) {
        User user = authService.getUserByIdOrThrow(currentUserId);
        Event event = eventService.getEntityOrThrow(eventId);

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ConflictException("Bu etkinlik şu an kayıtlara açık değil");
        }
        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ConflictException("Başlamış/sona ermiş etkinliğe kayıt olunamaz");
        }
        if (registrationRepository.findByEventIdAndUserId(eventId, currentUserId).isPresent()) {
            throw new ConflictException("Bu etkinliğe zaten kayıtlısınız");
        }

        long confirmed = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);
        RegistrationStatus status = confirmed < event.getCapacity()
                ? RegistrationStatus.CONFIRMED
                : RegistrationStatus.WAITLISTED;

        Registration registration = Registration.builder()
                .event(event)
                .user(user)
                .status(status)
                .registeredAt(LocalDateTime.now())
                .build();
        return toResponse(registrationRepository.save(registration));
    }

    @Transactional
    public void cancel(Long currentUserId, Long eventId) {
        Registration registration = registrationRepository
                .findByEventIdAndUserId(eventId, currentUserId)
                .orElseThrow(() -> new NotFoundException("Kayıt bulunamadı"));
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> listMyRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> listByEvent(Long eventId, Long currentUserId) {
        Event event = eventService.getEntityOrThrow(eventId);
        User actor = authService.getUserByIdOrThrow(currentUserId);
        boolean isOrganizer = event.getOrganizer().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        if (!isOrganizer && !isAdmin) {
            throw new UnauthorizedException("Katılımcı listesini yalnızca organizatör veya yönetici görebilir");
        }
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::toResponse).toList();
    }
}