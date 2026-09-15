package com.example.eventmgmt.controller;

import com.example.eventmgmt.dto.EventRequest;
import com.example.eventmgmt.dto.EventResponse;
import com.example.eventmgmt.exception.UnauthorizedException;
import com.example.eventmgmt.model.enums.EventCategory;
import com.example.eventmgmt.model.enums.EventStatus;
import com.example.eventmgmt.security.JwtAuthFilter;
import com.example.eventmgmt.service.EventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public Page<EventResponse> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return eventService.list(page, size);
    }

    @GetMapping("/search")
    public Page<EventResponse> search(@RequestParam(required = false) String title,
                                      @RequestParam(required = false) EventCategory category,
                                      @RequestParam(required = false) String city,
                                      @RequestParam(defaultValue = "false") boolean includeCancelled,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return eventService.search(title, category, city, includeCancelled, page, size);
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable Long id) {
        return eventService.getById(id);
    }

    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody EventRequest request,
                                                HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.create(requireUserId(httpRequest), request));
    }

    @GetMapping("/organizer/{id}")
    public Page<EventResponse> listByOrganizer(@PathVariable Long id,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return eventService.listByOrganizer(id, page, size);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id,
                                @Valid @RequestBody EventRequest request,
                                HttpServletRequest httpRequest) {
        return eventService.update(id, requireUserId(httpRequest), request);
    }

    @PatchMapping("/{id}/status")
    public EventResponse setStatus(@PathVariable Long id,
                                   @RequestBody EventStatus status,
                                   HttpServletRequest httpRequest) {
        eventService.setStatus(id, requireUserId(httpRequest), status);
        return eventService.getById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        eventService.delete(id, requireUserId(httpRequest));
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