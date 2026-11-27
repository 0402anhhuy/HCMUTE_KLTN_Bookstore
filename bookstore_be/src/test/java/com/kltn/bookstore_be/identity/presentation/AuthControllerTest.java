package com.kltn.bookstore_be.identity.presentation;

import com.kltn.bookstore_be.identity.application.ForgotPasswordRequest;
import com.kltn.bookstore_be.identity.application.LoginRequest;
import com.kltn.bookstore_be.identity.application.RegisterRequest;
import com.kltn.bookstore_be.identity.application.ResetPasswordRequest;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.application.VerifyOtpRequest;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/auth/register thành công trả về 200 và email")
    void registerUser_validRequest_returnsOk() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Nguyen Van A");
        req.setEmail("user@example.com");
        req.setPhone("0901234567");
        req.setPassword("secret123");
        req.setAddress("123 Le Loi");

        User saved = User.builder().id(1L).email("user@example.com").build();
        when(userService.register(any(RegisterRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register thất bại trả về 400 với error")
    void registerUser_serviceThrows_returnsBadRequest() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Nguyen Van A");
        req.setEmail("dup@example.com");
        req.setPhone("0901234567");
        req.setPassword("secret123");
        req.setAddress("123 Le Loi");

        when(userService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email đã tồn tại"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email đã tồn tại"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register validate thất bại trả về 400")
    void registerUser_invalidDto_returnsBadRequest() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("not-an-email");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/verify-otp hợp lệ trả về 200")
    void verifyOtp_valid_returnsOk() throws Exception {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("user@example.com");
        req.setOtpCode("123456");

        when(userService.verifyRegisterOtp("user@example.com", "123456")).thenReturn(true);

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/verify-otp sai mã hoặc exception trả về 400")
    void verifyOtp_invalidOrException_returnsBadRequest() throws Exception {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("user@example.com");
        req.setOtpCode("000000");

        when(userService.verifyRegisterOtp("user@example.com", "000000")).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        when(userService.verifyRegisterOtp("user@example.com", "000000"))
                .thenThrow(new RuntimeException("OTP lỗi"));

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("OTP lỗi"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login thành công trả về token và thông tin user")
    void login_validCredentials_returnsTokenAndUser() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("secret123");
        req.setRememberMe(true);

        Authentication auth = new UsernamePasswordAuthenticationToken("user@example.com", "secret123");
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(tokenProvider.generateToken(auth, true)).thenReturn("jwt-token-abc");

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .fullName("Nguyen Van A")
                .phone("0901234567")
                .address("HCM")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();
        when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-abc"))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login xử lý BadCredentials, Locked, Disabled và lỗi hệ thống")
    void login_authExceptions_returnBadRequest() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("wrong");

        doThrow(new BadCredentialsException("bad")).when(authenticationManager).authenticate(any());
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email hoặc mật khẩu không chính xác."));

        doThrow(new LockedException("locked")).when(authenticationManager).authenticate(any());
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."));

        doThrow(new DisabledException("disabled")).when(authenticationManager).authenticate(any());
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP qua Email."));

        doThrow(new RuntimeException()).when(authenticationManager).authenticate(any());
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Đã có lỗi xảy ra khi đăng nhập."));
    }

    @Test
    @DisplayName("POST /api/v1/auth/forgot-password thành công và thất bại")
    void forgotPassword_handlesSuccessAndFailure() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("user@example.com");

        doNothing().when(userService).requestPasswordReset("user@example.com");
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        doThrow(new RuntimeException("Email không tồn tại"))
                .when(userService).requestPasswordReset("user@example.com");
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email không tồn tại"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/reset-password thành công, sai OTP và exception")
    void resetPassword_handlesAllBranches() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail("user@example.com");
        req.setOtpCode("123456");
        req.setNewPassword("newSecret123");

        when(userService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(true);
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        when(userService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(false);
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        when(userService.resetPassword(any(ResetPasswordRequest.class)))
                .thenThrow(new RuntimeException("Lỗi reset"));
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Lỗi reset"));
    }
}
