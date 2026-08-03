package com.kltn.bookstore_be.identity.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.identity.domain.OtpToken;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.UserRepository;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.notification.domain.Notification;
import com.kltn.bookstore_be.ordering.domain.Cart;
import com.kltn.bookstore_be.ordering.domain.CartRepository;
import com.kltn.bookstore_be.ordering.domain.Coupon;
import com.kltn.bookstore_be.ordering.domain.CouponRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public User register(RegisterRequest request) {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        User user;
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getStatus() == User.UserStatus.LOCKED
                    && "Đang chờ xác thực mã OTP qua Email".equals(existingUser.getLockedReason())) {
                existingUser.setFullName(request.getFullName());
                existingUser.setPhone(request.getPhone());
                existingUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                existingUser.setAddress(request.getAddress());
                user = existingUser;
            } else {
                throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác");
            }
        } else {
            user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .address(request.getAddress())
                    .role(User.Role.USER)
                    .status(User.UserStatus.LOCKED)
                    .lockedReason("Đang chờ xác thực mã OTP qua Email")
                    .build();
        }

        User savedUser = userRepository.save(user);

        // Generate and send OTP code
        otpService.generateAndSendOtp(savedUser, OtpToken.OtpType.REGISTER);

        return savedUser;
    }

    @Transactional
    public boolean verifyRegisterOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        boolean isOtpValid = otpService.verifyOtp(user.getId(), otpCode, OtpToken.OtpType.REGISTER);
        if (!isOtpValid) {
            return false;
        }

        // Activate User
        user.setStatus(User.UserStatus.ACTIVE);
        user.setLockedReason(null);
        user.setLockedAt(null);
        userRepository.save(user);

        // Create empty Cart for the User
        if (cartRepository.findByUserId(user.getId()).isEmpty()) {
            Cart cart = Cart.builder().user(user).build();
            cartRepository.save(cart);
        }

        // Log and Notify
        auditLogService.log(user, "REGISTER", "Đăng ký tài khoản thành công qua xác thực OTP");
        notificationService.createNotification(
                user,
                "Chào mừng bạn đến với UTEShop",
                "Tài khoản của bạn đã được kích hoạt thành công. Bắt đầu mua sắm ngay!",
                Notification.NotificationType.ACCOUNT,
                "users",
                user.getId());

        return true;
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        otpService.generateAndSendOtp(user, OtpToken.OtpType.RESET_PASSWORD);
    }

    @Transactional
    public boolean resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        boolean isOtpValid = otpService.verifyOtp(user.getId(), request.getOtpCode(), OtpToken.OtpType.RESET_PASSWORD);
        if (!isOtpValid) {
            return false;
        }

        // Update Password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Audit Log and Notification
        auditLogService.log(user, "RESET_PASSWORD", "Khôi phục mật khẩu thành công qua OTP");
        notificationService.createNotification(
                user,
                "Thay đổi mật khẩu thành công",
                "Mật khẩu của bạn đã được thay đổi thành công thông qua chức năng khôi phục mật khẩu.",
                Notification.NotificationType.ACCOUNT,
                "users",
                user.getId());

        return true;
    }

    @Transactional
    public User updateProfile(User user, UpdateProfileRequest request) {
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        auditLogService.log(updatedUser, "UPDATE_PROFILE", "Cập nhật thông tin cá nhân");
        return updatedUser;
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.log(user, "CHANGE_PASSWORD", "Thay đổi mật khẩu cá nhân");
        notificationService.createNotification(
                user,
                "Bảo mật tài khoản",
                "Mật khẩu của bạn đã được thay đổi thành công.",
                Notification.NotificationType.ACCOUNT,
                "users",
                user.getId());
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetails) {
            String email = ((UserDetails) auth.getPrincipal()).getUsername();
            return this.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Người dùng chưa được xác thực"));
        }
        throw new RuntimeException("Xin lỗi, bạn cần đăng nhập trước");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void updateLastLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
