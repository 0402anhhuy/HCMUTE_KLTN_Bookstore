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
import com.kltn.bookstore_be.ordering.domain.OrderRepository;
import com.kltn.bookstore_be.review.domain.ProductReviewRepository;
import com.kltn.bookstore_be.identity.domain.OtpTokenRepository;
import com.kltn.bookstore_be.audit.domain.AuditLogRepository;
import com.kltn.bookstore_be.notification.domain.NotificationRepository;
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
    private final OrderRepository orderRepository;
    private final ProductReviewRepository productReviewRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

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
                "Chào mừng bạn đến với Bookstore",
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
        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            String[] addresses = request.getAddress().split(" \\|\\| ");
            if (addresses.length > 5) {
                throw new RuntimeException("Bạn chỉ được phép lưu tối đa 5 địa chỉ nhận hàng.");
            }
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            if (!phone.matches("^(0|\\+84)[35789]\\d{8}$")) {
                throw new RuntimeException("Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ: 0909123456).");
            }
        }
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
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

    @Transactional
    public User createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(User.UserStatus.ACTIVE)
                .rewardPoints(0)
                .build();

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == User.Role.USER) {
            Cart cart = Cart.builder().user(savedUser).build();
            cartRepository.save(cart);
        }

        auditLogService.log(savedUser, "CREATE_USER_BY_ADMIN", "Tài khoản được tạo bởi Quản trị viên");
        return savedUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUserByAdmin(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        boolean hasOrders = !orderRepository.findByUserIdOrderByCreatedAtDesc(id).isEmpty();
        boolean hasReviews = productReviewRepository.existsByUserId(id);

        if (hasOrders || hasReviews) {
            user.setStatus(User.UserStatus.LOCKED);
            user.setLockedReason("Vi phạm ràng buộc dữ liệu: Tài khoản có lịch sử giao dịch/đánh giá.");
            user.setLockedAt(LocalDateTime.now());
            userRepository.save(user);
            throw new RuntimeException("Tài khoản không thể xóa vĩnh viễn do đã có lịch sử. Hệ thống đã tự động khóa tài khoản thay thế.");
        }

        cartRepository.findByUserId(id).ifPresent(cartRepository::delete);
        otpTokenRepository.deleteByUserId(id);
        notificationRepository.deleteByUserId(id);
        auditLogRepository.deleteByUserId(id);
        
        userRepository.delete(user);
    }

    @Transactional
    public User updateUserByAdmin(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        Optional<User> existingEmailUser = userRepository.findByEmail(request.getEmail());
        if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(id)) {
            throw new RuntimeException("Email đã được sử dụng bởi một tài khoản khác trong hệ thống");
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            if (!request.getPhone().trim().matches("^(0|\\+84)[35789]\\d{8}$")) {
                throw new RuntimeException("Số điện thoại không hợp lệ");
            }
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        User updatedUser = userRepository.save(user);
        
        auditLogService.log(updatedUser, "UPDATE_USER_BY_ADMIN", "Tài khoản được cập nhật bởi Quản trị viên");
        return updatedUser;
    }

    @Transactional
    public User updateUserStatusByAdmin(Long id, User.UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        user.setStatus(status);
        userRepository.save(user);

        auditLogService.log(user, "UPDATE_STATUS_BY_ADMIN", "Trạng thái được cập nhật bởi Quản trị viên thành " + status.name());
        return user;
    }

    @Transactional
    public void updateLastLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
