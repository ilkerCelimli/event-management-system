package com.example.eventmgmt.config;

import com.example.eventmgmt.model.entity.Event;
import com.example.eventmgmt.model.entity.Registration;
import com.example.eventmgmt.model.entity.User;
import com.example.eventmgmt.model.enums.EventCategory;
import com.example.eventmgmt.model.enums.EventStatus;
import com.example.eventmgmt.model.enums.RegistrationStatus;
import com.example.eventmgmt.model.enums.Role;
import com.example.eventmgmt.repository.EventRepository;
import com.example.eventmgmt.repository.RegistrationRepository;
import com.example.eventmgmt.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds demo users, events and a registration on first startup.
 * Disable via app.seed-enabled=false in application.yml.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           EventRepository eventRepository,
                           RegistrationRepository registrationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        seed();
    }

    private void seed() {
        LocalDateTime now = LocalDateTime.now();

        User admin = user("admin", "admin@example.com", "admin123", "Sistem Yöneticisi", Role.ADMIN, now);
        User organizer = user("organizer", "organizer@example.com", "organizer123", "Ayşe Yılmaz", Role.ORGANIZER, now);
        User attendee = user("attendee", "attendee@example.com", "attendee123", "Mehmet Demir", Role.ATTENDEE, now);

        Event conference = event("Spring Boot ile Mikroservis Mimarisi",
                "Spring Boot ve PostgreSQL ile ölçeklenebilir mikroservis geliştirme",
                EventCategory.CONFERENCE, EventStatus.PUBLISHED, "İstanbul Kongre Merkezi",
                "Beşiktaş", "İstanbul", now.plusDays(14), now.plusDays(14).plusHours(8), 200, organizer, now);
        Event workshop = event("Java 17 ile Fonksiyonel Programlama Atölyesi",
                "Record'lar, lambda'lar ve Stream API'leri ile modern Java",
                EventCategory.WORKSHOP, EventStatus.PUBLISHED, "Ankara Teknoloji Parkı",
                "Ostim", "Ankara", now.plusDays(7), now.plusDays(7).plusHours(4), 30, organizer, now);

        User savedAttendee = userRepository.save(attendee);
        Event savedConference = eventRepository.save(conference);
        eventRepository.save(workshop);

        Registration reg = Registration.builder()
                .event(savedConference)
                .user(savedAttendee)
                .status(RegistrationStatus.CONFIRMED)
                .registeredAt(now)
                .build();
        registrationRepository.save(reg);
    }

    private User user(String username, String email, String password, String fullName, Role role, LocalDateTime now) {
        return userRepository.save(User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(role)
                .createdAt(now)
                .build());
    }

    private Event event(String title, String description, EventCategory category, EventStatus status,
                        String venue, String address, String city,
                        LocalDateTime start, LocalDateTime end, int capacity, User organizer, LocalDateTime now) {
        return Event.builder()
                .title(title)
                .description(description)
                .category(category)
                .status(status)
                .venueName(venue)
                .address(address)
                .city(city)
                .startTime(start)
                .endTime(end)
                .capacity(capacity)
                .organizer(organizer)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}