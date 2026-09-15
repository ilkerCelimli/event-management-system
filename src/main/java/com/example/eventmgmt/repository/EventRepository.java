package com.example.eventmgmt.repository;

import com.example.eventmgmt.model.entity.Event;
import com.example.eventmgmt.model.enums.EventCategory;
import com.example.eventmgmt.model.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizerId(Long organizerId);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE "
            + "(:title IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND "
            + "(:category IS NULL OR e.category = :category) AND "
            + "(:city IS NULL OR LOWER(e.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND "
            + "((:includeCancelled = true) OR e.status <> 'CANCELLED')")
    Page<Event> search(@Param("title") String title,
                       @Param("category") EventCategory category,
                       @Param("city") String city,
                       @Param("includeCancelled") Boolean includeCancelled,
                       Pageable pageable);
}