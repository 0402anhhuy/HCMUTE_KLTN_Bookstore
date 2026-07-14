package com.kltn.bookstore_be.identity.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.ordering.domain.Cart;
import com.kltn.bookstore_be.ordering.domain.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    private User sampleUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("test@example.com")
                .phone("0123456789")
                .passwordHash("hashedPassword")
                .address("123 ABC Street")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .rewardPoints(0)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Nguyen Van A");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPhone("0123456789");
        registerRequest.setPassword("password123");
        registerRequest.setAddress("123 ABC Street");
    }

    @Nested
    @DisplayName("Guest - Đăng ký tài khoản")
    class RegisterTests {

        @Test
        @DisplayName("Đăng ký thành công với email mới")
        void register_newEmail_success() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
            when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User u = invocation.getArgument(0);
                u.setId(1L);
                return u;
            });

            User result = userService.register(registerRequest);

            assertNotNull(result);
            assertEquals("Nguyen Van A", result.getFullName());
            assertEquals("test@example.com", result.getEmail());
            assertEquals(User.Role.USER, result.getRole());
            assertEquals(User.UserStatus.LOCKED, result.getStatus());
            assertEquals("Đang chờ xác thực mã OTP qua Email", result.getLockedReason());
            verify(otpService).generateAndSendOtp(any(User.class), eq(OtpToken.OtpType.REGISTER));
        }

        @Test
        @DisplayName("Đăng ký lại với email đang chờ xác thực OTP - cập nhật thông tin")
        void register_existingPendingUser_updatesInfo() {
            User pendingUser = User.builder()
                    .id(2L)
                    .email("test@example.com")
                    .status(User.UserStatus.LOCKED)
                    .lockedReason("Đang chờ xác thực mã OTP qua Email")
                    .build();

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(pendingUser));
            when(passwordEncoder.encode("password123")).thenReturn("newEncodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(pendingUser);

            User result = userService.register(registerRequest);

            assertEquals("Nguyen Van A", result.getFullName());
            assertEquals("0123456789", result.getPhone());
            verify(otpService).generateAndSendOtp(any(User.class), eq(OtpToken.OtpType.REGISTER));
        }

        @Test
        @DisplayName("Đăng ký với email đã được sử dụng bởi tài khoản ACTIVE - ném exception")
        void register_existingActiveUser_throwsException() {
            User activeUser = User.builder()
                    .id(3L)
                    .email("test@example.com")
                    .status(User.UserStatus.ACTIVE)
                    .build();

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                userService.register(registerRequest);
            });

            assertEquals("Email đã được sử dụng bởi tài khoản khác", exception.getMessage());
            verify(otpService, never()).generateAndSendOtp(any(), any());
        }
    }

    @Nested
    @DisplayName("Guest - Xác thực OTP đăng ký")
    class VerifyRegisterOtpTests {

        @Test
        @DisplayName("Xác thực OTP thành công - kích hoạt tài khoản và tạo giỏ hàng")
        void verifyRegisterOtp_validOtp_activatesUserAndCreatesCart() {
            User lockedUser = User.builder()
                    .id(1L)
                    .email("test@example.com")
                    .status(User.UserStatus.LOCKED)
                    .lockedReason("Đang chờ xác thực mã OTP qua Email")
                    .build();

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(lockedUser));
            when(otpService.verifyOtp(1L, "123456", OtpToken.OtpType.REGISTER)).thenReturn(true);
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(lockedUser);
            when(cartRepository.save(any(Cart.class))).thenReturn(Cart.builder().id(1L).build());

            boolean result = userService.verifyRegisterOtp("test@example.com", "123456");

            assertTrue(result);
            assertEquals(User.UserStatus.ACTIVE, lockedUser.getStatus());
            assertNull(lockedUser.getLockedReason());
            verify(cartRepository).save(any(Cart.class));
            verify(auditLogService).log(eq(lockedUser), eq("REGISTER"), anyString());
            verify(notificationService).createNotification(eq(lockedUser), anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Xác thực OTP sai - trả về false")
        void verifyRegisterOtp_invalidOtp_returnsFalse() {
            User lockedUser = User.builder()
                    .id(1L)
                    .email("test@example.com")
                    .status(User.UserStatus.LOCKED)
                    .build();

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(lockedUser));
            when(otpService.verifyOtp(1L, "000000", OtpToken.OtpType.REGISTER)).thenReturn(false);

            boolean result = userService.verifyRegisterOtp("test@example.com", "000000");

            assertFalse(result);
            assertEquals(User.UserStatus.LOCKED, lockedUser.getStatus());
            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Xác thực OTP với email không tồn tại - ném exception")
        void verifyRegisterOtp_emailNotFound_throwsException() {
            when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                userService.verifyRegisterOtp("nonexistent@example.com", "123456");
            });
        }
    }

    @Nested
    @DisplayName("Guest - Quên/Đặt lại mật khẩu")
    class PasswordResetTests {

        @Test
        @DisplayName("Gửi OTP quên mật khẩu thành công")
        void requestPasswordReset_validEmail_sendsOtp() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

            userService.requestPasswordReset("test@example.com");

            verify(otpService).generateAndSendOtp(sampleUser, OtpToken.OtpType.RESET_PASSWORD);
        }

        @Test
        @DisplayName("Gửi OTP quên mật khẩu với email không tồn tại - ném exception")
        void requestPasswordReset_invalidEmail_throwsException() {
            when(userRepository.findByEmail("invalid@example.com")).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                userService.requestPasswordReset("invalid@example.com");
            });
        }

        @Test
        @DisplayName("Đặt lại mật khẩu thành công")
        void resetPassword_validOtp_success() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setEmail("test@example.com");
            request.setOtpCode("123456");
            request.setNewPassword("newPassword123");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
            when(otpService.verifyOtp(1L, "123456", OtpToken.OtpType.RESET_PASSWORD)).thenReturn(true);
            when(passwordEncoder.encode("newPassword123")).thenReturn("newEncodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);

            boolean result = userService.resetPassword(request);

            assertTrue(result);
            assertEquals("newEncodedPassword", sampleUser.getPasswordHash());
            verify(auditLogService).log(eq(sampleUser), eq("RESET_PASSWORD"), anyString());
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Đặt lại mật khẩu với OTP sai - trả về false")
        void resetPassword_invalidOtp_returnsFalse() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setEmail("test@example.com");
            request.setOtpCode("000000");
            request.setNewPassword("newPassword123");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
            when(otpService.verifyOtp(1L, "000000", OtpToken.OtpType.RESET_PASSWORD)).thenReturn(false);

            boolean result = userService.resetPassword(request);

            assertFalse(result);
            verify(passwordEncoder, never()).encode(any());
        }
    }

    @Nested
    @DisplayName("User - Cập nhật hồ sơ cá nhân")
    class UpdateProfileTests {

        @Test
        @DisplayName("Cập nhật hồ sơ thành công với đầy đủ thông tin")
        void updateProfile_fullInfo_success() {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFullName("Nguyen Van B");
            request.setPhone("0987654321");
            request.setAddress("456 DEF Street");
            request.setAvatarUrl("http://example.com/avatar.jpg");

            when(userRepository.save(any(User.class))).thenReturn(sampleUser);

            User result = userService.updateProfile(sampleUser, request);

            assertEquals("Nguyen Van B", sampleUser.getFullName());
            assertEquals("0987654321", sampleUser.getPhone());
            assertEquals("456 DEF Street", sampleUser.getAddress());
            assertEquals("http://example.com/avatar.jpg", sampleUser.getAvatarUrl());
            verify(auditLogService).log(any(User.class), eq("UPDATE_PROFILE"), anyString());
        }

        @Test
        @DisplayName("Cập nhật hồ sơ không có avatar - không thay đổi avatar cũ")
        void updateProfile_noAvatar_keepsOldAvatar() {
            sampleUser.setAvatarUrl("http://example.com/old-avatar.jpg");

            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFullName("Nguyen Van C");
            request.setPhone("0111222333");
            request.setAddress("789 GHI Street");
            request.setAvatarUrl(null);

            when(userRepository.save(any(User.class))).thenReturn(sampleUser);

            userService.updateProfile(sampleUser, request);

            assertEquals("http://example.com/old-avatar.jpg", sampleUser.getAvatarUrl());
        }
    }

    @Nested
    @DisplayName("User - Đổi mật khẩu")
    class ChangePasswordTests {

        @Test
        @DisplayName("Đổi mật khẩu thành công")
        void changePassword_correctOldPassword_success() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword("oldPassword");
            request.setNewPassword("newPassword123");

            when(passwordEncoder.matches("oldPassword", "hashedPassword")).thenReturn(true);
            when(passwordEncoder.encode("newPassword123")).thenReturn("newHashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);

            userService.changePassword(sampleUser, request);

            assertEquals("newHashedPassword", sampleUser.getPasswordHash());
            verify(auditLogService).log(eq(sampleUser), eq("CHANGE_PASSWORD"), anyString());
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Đổi mật khẩu với mật khẩu cũ sai - ném exception")
        void changePassword_wrongOldPassword_throwsException() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword("wrongOldPassword");
            request.setNewPassword("newPassword123");

            when(passwordEncoder.matches("wrongOldPassword", "hashedPassword")).thenReturn(false);

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                userService.changePassword(sampleUser, request);
            });

            assertEquals("Mật khẩu cũ không chính xác", exception.getMessage());
            verify(passwordEncoder, never()).encode(any());
        }
    }

    @Nested
    @DisplayName("User - Các chức năng bổ trợ")
    class HelperTests {

        @Test
        @DisplayName("Tìm người dùng theo email")
        void findByEmail_existingUser_returnsUser() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

            Optional<User> result = userService.findByEmail("test@example.com");

            assertTrue(result.isPresent());
            assertEquals("Nguyen Van A", result.get().getFullName());
        }

        @Test
        @DisplayName("Cập nhật thời gian đăng nhập cuối")
        void updateLastLogin_setsCurrentTime() {
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);

            userService.updateLastLogin(sampleUser);

            assertNotNull(sampleUser.getLastLoginAt());
            verify(userRepository).save(sampleUser);
        }
    }
}
