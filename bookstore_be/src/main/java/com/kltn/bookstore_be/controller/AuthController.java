package com.kltn.bookstore_be.controller;

import com.kltn.bookstore_be.entity.User;
import com.kltn.bookstore_be.identity.application.LoginRequest;
import com.kltn.bookstore_be.identity.application.LoginResponse;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v2/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userService.findByEmail(request.getEmail());

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(jwt)
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .status(user.getStatus().name())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sai email hoặc mật khẩu. " + e.getMessage()));
        }
    }
}
