package com.example.eventmgmt.service;

import com.example.eventmgmt.dto.*;
import com.example.eventmgmt.exception.ConflictException;
import com.example.eventmgmt.exception.NotFoundException;
import com.example.eventmgmt.exception.UnauthorizedException;
import com.example.eventmgmt.model.entity.User;
import com.example.eventmgmt.model.enums.Role;
import com.example.eventmgmt.repository.UserRepository;
import com.example.eventmgmt.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Bu kullanıcı adı zaten kullanılıyor");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Bu e-posta adresi zaten kayıtlı");
        }
        Role role = request.role() == null ? Role.ATTENDEE : request.role();
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();
        user = userRepository.save(user);
        return AuthResponse.of(jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name()),
                userService.toResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UnauthorizedException("Kullanıcı adı veya şifre hatalı"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı");
        }
        return AuthResponse.of(jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name()),
                userService.toResponse(user));
    }

    public User getUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
    }
}