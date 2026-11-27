package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.ordering.application.CheckoutRequest;
import com.kltn.bookstore_be.ordering.application.OrderResponse;
import com.kltn.bookstore_be.ordering.application.OrderService;
import com.kltn.bookstore_be.ordering.domain.CouponRepository;
import com.kltn.bookstore_be.ordering.domain.Order;
import com.kltn.bookstore_be.ordering.domain.OrderItem;
import com.kltn.bookstore_be.ordering.domain.ReturnRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class OrderControllerTest {

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
    private OrderService orderService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private CouponRepository couponRepository;

    private User buildUser(Long id, User.Role role) {
        return User.builder().id(id).email("user" + id + "@example.com").role(role).build();
    }

    private Order buildOrder(Long id, User owner) {
        return Order.builder()
                .id(id)
                .user(owner)
                .totalAmount(BigDecimal.valueOf(200000))
                .finalAmount(BigDecimal.valueOf(200000))
                .paymentMethod(Order.PaymentMethod.COD)
                .shippingAddress("HCM")
                .status(Order.OrderStatus.pending)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/orders khi chưa đăng nhập trả về 401")
    void getMyOrders_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/orders/checkout thành công và lỗi nghiệp vụ")
    void checkout_handlesSuccessAndFailure() throws Exception {
        User owner = buildUser(1L, User.Role.USER);
        CheckoutRequest req = new CheckoutRequest();
        req.setShippingAddress("123 Nguyen Hue");
        req.setRecipientPhone("0901234567");
        req.setPaymentMethod(Order.PaymentMethod.COD);

        OrderResponse res = OrderResponse.builder()
                .orderId(55L)
                .status("pending")
                .finalAmount(BigDecimal.valueOf(150000))
                .build();

        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(orderService.checkout(eq(owner), any(CheckoutRequest.class), any(HttpServletRequest.class)))
                .thenReturn(res);

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(55))
                .andExpect(jsonPath("$.status").value("pending"));

        when(orderService.checkout(eq(owner), any(CheckoutRequest.class), any(HttpServletRequest.class)))
                .thenThrow(new RuntimeException("Giỏ hàng trống"));

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Giỏ hàng trống"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/orders và GET /api/v1/orders/{id} kiểm tra phân quyền chủ đơn và admin")
    void getOrders_andDetails_checkOwnership() throws Exception {
        User owner = buildUser(1L, User.Role.USER);
        User stranger = buildUser(2L, User.Role.USER);
        User admin = buildUser(3L, User.Role.ADMIN);
        Order order = buildOrder(10L, owner);

        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(orderService.getUserOrders(1L)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10));

        when(orderService.getOrderById(10L)).thenReturn(order);
        when(orderService.getOrderItems(10L)).thenReturn(List.of(OrderItem.builder().id(1L).quantity(1).build()));

        mockMvc.perform(get("/api/v1/orders/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order.id").value(10))
                .andExpect(jsonPath("$.items[0].quantity").value(1));

        when(userService.getAuthenticatedUser()).thenReturn(stranger);
        mockMvc.perform(get("/api/v1/orders/10"))
                .andExpect(status().isForbidden());

        when(userService.getAuthenticatedUser()).thenReturn(admin);
        mockMvc.perform(get("/api/v1/orders/10"))
                .andExpect(status().isOk());

        when(orderService.getOrderById(99L)).thenThrow(new RuntimeException("Không tìm thấy đơn hàng"));
        mockMvc.perform(get("/api/v1/orders/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Không tìm thấy đơn hàng"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /cancel, PUT /address, POST /return và GET /returns/my xử lý thành công và lỗi")
    void userOrderActions_handleSuccessAndFailure() throws Exception {
        User owner = buildUser(1L, User.Role.USER);
        when(userService.getAuthenticatedUser()).thenReturn(owner);

        doNothing().when(orderService).cancelOrder(10L, "Đổi ý", owner);
        mockMvc.perform(post("/api/v1/orders/10/cancel").param("reason", "Đổi ý"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        doThrow(new RuntimeException("Không thể hủy")).when(orderService).cancelOrder(10L, "Trễ", owner);
        mockMvc.perform(post("/api/v1/orders/10/cancel").param("reason", "Trễ"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Không thể hủy"));

        doNothing().when(orderService).updateOrderAddress(10L, "Hà Nội", "0912345678", owner);
        mockMvc.perform(put("/api/v1/orders/10/address")
                        .param("address", "Hà Nội")
                        .param("phone", "0912345678"))
                .andExpect(status().isOk());

        doNothing().when(orderService).requestReturn(10L, "Sách rách", "RETURN_REFUND", "img.jpg", owner);
        mockMvc.perform(post("/api/v1/orders/10/return")
                        .param("reason", "Sách rách")
                        .param("evidenceImages", "img.jpg"))
                .andExpect(status().isOk());

        ReturnRequest rr = ReturnRequest.builder().id(5L).reason("Sách rách").status(ReturnRequest.ReturnStatus.PENDING).build();
        when(orderService.getUserReturnRequests(1L)).thenReturn(List.of(rr));
        mockMvc.perform(get("/api/v1/orders/returns/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /{id}/return kiểm tra quyền chủ đơn và admin")
    void getOrderReturnRequest_checksOwnership() throws Exception {
        User owner = buildUser(1L, User.Role.USER);
        User stranger = buildUser(2L, User.Role.USER);
        Order order = buildOrder(10L, owner);
        ReturnRequest rr = ReturnRequest.builder().id(8L).reason("Lỗi in").status(ReturnRequest.ReturnStatus.PENDING).build();

        when(orderService.getOrderById(10L)).thenReturn(order);
        when(orderService.getReturnRequestByOrderId(10L)).thenReturn(Optional.of(rr));
        when(userService.getAuthenticatedUser()).thenReturn(owner);

        mockMvc.perform(get("/api/v1/orders/10/return"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(8));

        when(userService.getAuthenticatedUser()).thenReturn(stranger);
        mockMvc.perform(get("/api/v1/orders/10/return"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("Các endpoint quản trị đơn hàng kiểm tra 403 với USER và 200 với MANAGER")
    void managerEndpoints_enforceRoleAndExecute() throws Exception {
        User regularUser = buildUser(1L, User.Role.USER);
        User manager = buildUser(2L, User.Role.MANAGER);

        when(userService.getAuthenticatedUser()).thenReturn(regularUser);
        mockMvc.perform(get("/api/v1/orders/all")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/orders/returns")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/orders/returns/5/process").param("status", "APPROVED"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/orders/10/deliver")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/orders/10/assign-shipper").param("shipperId", "3"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/orders/10/status").param("status", "confirmed"))
                .andExpect(status().isForbidden());

        when(userService.getAuthenticatedUser()).thenReturn(manager);
        when(orderService.getAllOrders()).thenReturn(List.of(buildOrder(10L, regularUser)));
        when(orderService.getAllReturnRequests()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/orders/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10));
        mockMvc.perform(get("/api/v1/orders/returns"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/orders/returns/5/process").param("status", "APPROVED"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/orders/10/deliver"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/orders/10/assign-shipper").param("shipperId", "3"))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/v1/orders/10/status").param("status", "confirmed"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("Các endpoint quản trị đơn hàng trả về 400 khi service ném lỗi")
    void managerEndpoints_serviceThrows_returnsBadRequest() throws Exception {
        User manager = buildUser(2L, User.Role.MANAGER);
        when(userService.getAuthenticatedUser()).thenReturn(manager);

        when(orderService.getAllOrders()).thenThrow(new RuntimeException("DB error"));
        mockMvc.perform(get("/api/v1/orders/all")).andExpect(status().isBadRequest());

        when(orderService.getAllReturnRequests()).thenThrow(new RuntimeException("DB error"));
        mockMvc.perform(get("/api/v1/orders/returns")).andExpect(status().isBadRequest());

        doThrow(new RuntimeException("Invalid")).when(orderService)
                .processReturnRequest(5L, ReturnRequest.ReturnStatus.REJECTED, "No", manager);
        mockMvc.perform(post("/api/v1/orders/returns/5/process")
                        .param("status", "REJECTED")
                        .param("rejectedReason", "No"))
                .andExpect(status().isBadRequest());

        doThrow(new RuntimeException("Invalid")).when(orderService).deliverOrder(10L, manager);
        mockMvc.perform(post("/api/v1/orders/10/deliver")).andExpect(status().isBadRequest());

        doThrow(new RuntimeException("Invalid")).when(orderService).assignShipper(10L, 3L, manager);
        mockMvc.perform(post("/api/v1/orders/10/assign-shipper").param("shipperId", "3"))
                .andExpect(status().isBadRequest());

        doThrow(new RuntimeException("Invalid")).when(orderService)
                .updateOrderStatus(10L, Order.OrderStatus.shipping, manager);
        mockMvc.perform(put("/api/v1/orders/10/status").param("status", "shipping"))
                .andExpect(status().isBadRequest());
    }
}
