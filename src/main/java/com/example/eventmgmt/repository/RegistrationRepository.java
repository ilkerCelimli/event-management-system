package com.example.eventmgmt.repository;

import com.example.eventmgmt.model.entity.Event;
import com.example.eventmgmt.model.entity.Registration;
import com.example.eventmgmt.model.entity.User;
import com.example.eventmgmt.model.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByUserId(Long userId);

    List<Registration> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    long countByEvent(Event event);
}