package com.example.eventmgmt.model.entity;

import com.example.eventmgmt.model.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_reg_event_user", columnNames = {"event_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_reg_event", columnList = "event_id"),
                @Index(name = "idx_reg_user", columnList = "user_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;
}