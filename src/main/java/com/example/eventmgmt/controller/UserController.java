package com.example.eventmgmt.controller;

import com.example.eventmgmt.dto.UserResponse;
import com.example.eventmgmt.exception.UnauthorizedException;
import com.example.eventmgmt.model.entity.User;
import com.example.eventmgmt.model.enums.Role;
import com.example.eventmgmt.security.JwtAuthFilter;
import com.example.eventmgmt.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listUsers(HttpServletRequest httpRequest) {
        Long currentUserId = requireUserId(httpRequest);
        User actor = userService.getById(currentUserId);
        if (actor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Bu işlem için yönetici yetkisi gerekli");
        }
        return userService.listUsers();
    }

    @GetMapping("/me")
    public UserResponse me(HttpServletRequest httpRequest) {
        return userService.toResponse(userService.getById(requireUserId(httpRequest)));
    }

    private Long requireUserId(HttpServletRequest request) {
        Object value = request.getAttribute(JwtAuthFilter.CURRENT_USER_ID_ATTR);
        if (!(value instanceof Long)) {
            throw new UnauthorizedException("Kimlik doğrulama gerekli");
        }
        return (Long) value;
    }
}