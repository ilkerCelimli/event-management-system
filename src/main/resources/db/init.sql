-- ============================================================================
-- Event Management System - PostgreSQL schema (REFERENCE / MANUAL SETUP)
-- Not strictly required: with `spring.jpa.hibernate.ddl-auto: update` the app
-- creates its own schema. This script documents the expected structure and can
-- be used for environments where you prefer to manage DDL manually.
-- Run as postgres superuser:
--   psql -U postgres -f db/init.sql   (then review output)
-- ============================================================================

-- Create the database if it does not exist yet (psql meta-command, adaptive).
SELECT 'CREATE DATABASE eventdb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'eventdb')\gexec;

\connect eventdb

-- Postgres enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('ORGANIZER', 'ATTENDEE', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE registration_status AS ENUM ('CONFIRMED', 'WAITLISTED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
        CREATE TYPE event_category AS ENUM ('CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'SPORTS', 'EDUCATION', 'OTHER');
    END IF;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL     PRIMARY KEY,
    username      VARCHAR(50)   NOT NULL,
    email         VARCHAR(120)  NOT NULL,
    password_hash TEXT          NOT NULL,
    full_name     VARCHAR(120)  NOT NULL,
    role          role          NOT NULL DEFAULT 'ATTENDEE',
    created_at    TIMESTAMP     NOT NULL DEFAULT now(),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email    UNIQUE (email)
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id            BIGSERIAL        PRIMARY KEY,
    title         VARCHAR(200)     NOT NULL,
    description   VARCHAR(2000)    NOT NULL,
    category      event_category   NOT NULL,
    status        event_status     NOT NULL DEFAULT 'DRAFT',
    venue_name    VARCHAR(150),
    address       VARCHAR(300),
    city          VARCHAR(100),
    start_time    TIMESTAMP        NOT NULL,
    end_time      TIMESTAMP        NOT NULL,
    capacity      INTEGER          NOT NULL CHECK (capacity > 0),
    organizer_id  BIGINT           NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP        NOT NULL DEFAULT now()
);

-- Registrations (RSVP)
CREATE TABLE IF NOT EXISTS registrations (
    id            BIGSERIAL           PRIMARY KEY,
    event_id      BIGINT              NOT NULL REFERENCES events(id),
    user_id       BIGINT              NOT NULL REFERENCES users(id),
    status        registration_status NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMP           NOT NULL DEFAULT now(),
    CONSTRAINT uk_reg_event_user UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_reg_user  ON registrations(user_id);

-- Keep events.updated_at fresh
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated ON events;
CREATE TRIGGER trg_events_updated
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at(); -- PostgreSQL 14+