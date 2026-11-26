package com.kltn.bookstore_be.identity.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long id;
    private String token;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String role;
    private String status;
}
