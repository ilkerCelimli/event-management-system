package com.example.eventmgmt.service;

import com.example.eventmgmt.dto.EventRequest;
import com.example.eventmgmt.dto.EventResponse;
import com.example.eventmgmt.exception.NotFoundException;
import com.example.eventmgmt.exception.UnauthorizedException;
import com.example.eventmgmt.model.entity.Event;
import com.example.eventmgmt.model.entity.User;
import com.example.eventmgmt.model.enums.EventCategory;
import com.example.eventmgmt.model.enums.EventStatus;
import com.example.eventmgmt.model.enums.Role;
import com.example.eventmgmt.repository.EventRepository;
import com.example.eventmgmt.repository.RegistrationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AuthService authService;

    public EventService(EventRepository eventRepository,
                        RegistrationRepository registrationRepository,
                        AuthService authService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.authService = authService;
    }

    public EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getStatus(),
                event.getVenueName(),
                event.getAddress(),
                event.getCity(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCapacity(),
                event.getOrganizer().getId(),
                event.getOrganizer().getFullName(),
                registrationRepository.countByEvent(event),
                event.getCreatedAt(),
                event.getUpdatedAt());
    }

    @Transactional
    public EventResponse create(Long currentUserId, EventRequest request) {
        User organizer = authService.getUserByIdOrThrow(currentUserId);
        if (organizer.getRole() == Role.ATTENDEE) {
            throw new UnauthorizedException("Yalnızca organizatör veya yönetici etkinlik oluşturabilir");
        }
        validateTimeRange(request);
        LocalDateTime now = LocalDateTime.now();
        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .status(request.status() == null ? EventStatus.DRAFT : request.status())
                .venueName(request.venueName())
                .address(request.address())
                .city(request.city())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .capacity(request.capacity())
                .organizer(organizer)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return toResponse(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> list(int page, int size) {
        return eventRepository.findByStatus(EventStatus.PUBLISHED, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public EventResponse getById(Long id) {
        return toResponse(getEntityOrThrow(id));
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> search(String title, EventCategory category, String city,
                                      boolean includeCancelled, int page, int size) {
        return eventRepository.search(
                        isBlank(title) ? null : title,
                        category,
                        isBlank(city) ? null : city,
                        includeCancelled,
                        PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> listByOrganizer(Long organizerId, int page, int size) {
        List<EventResponse> content = eventRepository.findByOrganizerId(organizerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(content,
                PageRequest.of(page, size), content.size());
    }
@Transactional
    public EventResponse update(Long eventId, Long currentUserId, EventRequest request) {
        Event event = getEntityOrThrow(eventId);
        requireOrganizerOrAdmin(event, currentUserId);
        validateTimeRange(request);
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setCategory(request.category());
        if (request.status() != null) {
            event.setStatus(request.status());
        }
        event.setVenueName(request.venueName());
        event.setAddress(request.address());
        event.setCity(request.city());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCapacity(request.capacity());
        event.setUpdatedAt(LocalDateTime.now());
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public void setStatus(Long eventId, Long currentUserId, EventStatus status) {
        Event event = getEntityOrThrow(eventId);
        requireOrganizerOrAdmin(event, currentUserId);
        event.setStatus(status);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }

    @Transactional
    public void delete(Long eventId, Long currentUserId) {
        Event event = getEntityOrThrow(eventId);
        requireOrganizerOrAdmin(event, currentUserId);
        eventRepository.delete(event);
    }

    public Event getEntityOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Etkinlik bulunamadı"));
    }

    private void requireOrganizerOrAdmin(Event event, Long userId) {
        User actor = authService.getUserByIdOrThrow(userId);
        boolean isOrganizer = event.getOrganizer().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        if (!isOrganizer && !isAdmin) {
            throw new UnauthorizedException("Bu etkinliği yönetme yetkiniz yok");
        }
    }

    private void validateTimeRange(EventRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("Bitiş zamanı başlangıç zamanından sonra olmalıdır");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}