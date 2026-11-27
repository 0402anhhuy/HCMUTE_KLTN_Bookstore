package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.ordering.domain.Shipper;
import com.kltn.bookstore_be.ordering.domain.ShipperRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShipperController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ShipperControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private ShipperRepository shipperRepository;

    @MockitoBean
    private UserService userService;

    private User buildUser(User.Role role) {
        return User.builder().id(1L).email("staff@example.com").role(role).build();
    }

    private Shipper sampleShipper() {
        return Shipper.builder()
                .id(1L)
                .fullName("Nguyen Shipper")
                .phone("0901234567")
                .vehicle("Xe máy")
                .status(Shipper.ShipperStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/shippers chưa đăng nhập trả về 401")
    void getAllShippers_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/shippers")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Các endpoint ShipperController với role USER bị từ chối")
    void shipperEndpoints_userRole_returnsBadRequest() throws Exception {
        when(userService.getAuthenticatedUser()).thenReturn(buildUser(User.Role.USER));
        mockMvc.perform(get("/api/v1/shippers"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bạn không có quyền thực hiện chức năng này"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("GET/POST /api/v1/shippers kiểm tra validate tên, SĐT, trùng lặp và tạo thành công")
    void getAndCreateShipper_handleAllValidationAndSuccess() throws Exception {
        when(userService.getAuthenticatedUser()).thenReturn(buildUser(User.Role.MANAGER));
        Shipper shipper = sampleShipper();
        when(shipperRepository.findAll()).thenReturn(List.of(shipper));

        mockMvc.perform(get("/api/v1/shippers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Nguyen Shipper"));

        Shipper blankName = Shipper.builder().fullName(" ").phone("0901234567").build();
        mockMvc.perform(post("/api/v1/shippers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blankName)))
                .andExpect(status().isBadRequest());

        Shipper blankPhone = Shipper.builder().fullName("Test").phone(" ").build();
        mockMvc.perform(post("/api/v1/shippers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blankPhone)))
                .andExpect(status().isBadRequest());

        Shipper invalidPhone = Shipper.builder().fullName("Test").phone("12345").build();
        mockMvc.perform(post("/api/v1/shippers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPhone)))
                .andExpect(status().isBadRequest());

        when(shipperRepository.existsByPhone("0901234567")).thenReturn(true);
        mockMvc.perform(post("/api/v1/shippers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipper)))
                .andExpect(status().isBadRequest());

        when(shipperRepository.existsByPhone("0901234567")).thenReturn(false);
        when(shipperRepository.save(any(Shipper.class))).thenReturn(shipper);
        mockMvc.perform(post("/api/v1/shippers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipper)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("0901234567"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("PUT/DELETE /api/v1/shippers/{id} xử lý cập nhật, xóa và lỗi ràng buộc FK")
    void updateAndDeleteShipper_handleAllBranches() throws Exception {
        when(userService.getAuthenticatedUser()).thenReturn(buildUser(User.Role.MANAGER));
        Shipper existing = sampleShipper();
        when(shipperRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(shipperRepository.existsByPhoneAndIdNot("0912345678", 1L)).thenReturn(false);
        when(shipperRepository.save(any(Shipper.class))).thenReturn(existing);

        Shipper update = Shipper.builder()
                .fullName("Shipper Updated")
                .phone("0912345678")
                .vehicle("Xe tải")
                .status(Shipper.ShipperStatus.INACTIVE)
                .build();
        mockMvc.perform(put("/api/v1/shippers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        Shipper badName = Shipper.builder().fullName(" ").build();
        mockMvc.perform(put("/api/v1/shippers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badName)))
                .andExpect(status().isBadRequest());

        Shipper badPhone = Shipper.builder().phone("111").build();
        mockMvc.perform(put("/api/v1/shippers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPhone)))
                .andExpect(status().isBadRequest());

        when(shipperRepository.existsByPhoneAndIdNot("0909998887", 1L)).thenReturn(true);
        Shipper dupPhone = Shipper.builder().phone("0909998887").build();
        mockMvc.perform(put("/api/v1/shippers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupPhone)))
                .andExpect(status().isBadRequest());

        doNothing().when(shipperRepository).delete(existing);
        doNothing().when(shipperRepository).flush();
        mockMvc.perform(delete("/api/v1/shippers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        doThrow(new DataIntegrityViolationException("FK"))
                .when(shipperRepository).delete(existing);
        mockMvc.perform(delete("/api/v1/shippers/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}
