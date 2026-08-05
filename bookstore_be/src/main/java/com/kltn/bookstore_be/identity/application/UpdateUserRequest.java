package com.kltn.bookstore_be.identity.application;

import com.kltn.bookstore_be.identity.domain.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;

    @NotNull(message = "Vai trò không được để trống")
    private User.Role role;

    @NotNull(message = "Trạng thái không được để trống")
    private User.UserStatus status;
}
