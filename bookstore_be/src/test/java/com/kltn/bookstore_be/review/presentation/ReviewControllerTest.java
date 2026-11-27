package com.kltn.bookstore_be.review.presentation;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.review.application.ReviewRequest;
import com.kltn.bookstore_be.review.application.ReviewService;
import com.kltn.bookstore_be.review.domain.ProductReview;
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

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ReviewControllerTest {

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
    private ReviewService reviewService;

    @MockitoBean
    private UserService userService;

    private User buildUser(Long id, User.Role role) {
        return User.builder().id(id).email("u" + id + "@example.com").role(role).build();
    }

    private ProductReview sampleReview() {
        return ProductReview.builder()
                .id(1L)
                .rating(5)
                .comment("Sách rất hay")
                .status(ProductReview.ReviewStatus.VISIBLE)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/reviews/product/{productId} công khai và xử lý lỗi")
    void getProductReviews_handlesSuccessAndFailure() throws Exception {
        when(reviewService.getProductReviews(10L)).thenReturn(List.of(sampleReview()));
        mockMvc.perform(get("/api/v1/reviews/product/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rating").value(5));

        when(reviewService.getProductReviews(99L)).thenThrow(new RuntimeException("Không tìm thấy"));
        mockMvc.perform(get("/api/v1/reviews/product/99"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/reviews thêm đánh giá thành công, validate @Valid và kiểm tra 403 khi USER gọi GET /reviews")
    void addReview_andUserRestrictions_workCorrectly() throws Exception {
        User user = buildUser(1L, User.Role.USER);
        ReviewRequest req = new ReviewRequest();
        req.setOrderId(100L);
        req.setProductId(10L);
        req.setRating(5);
        req.setComment("Tuyệt vời");

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(reviewService.addReview(eq(user), any(ReviewRequest.class))).thenReturn(sampleReview());

        mockMvc.perform(post("/api/v1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review.id").value(1));

        mockMvc.perform(post("/api/v1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/v1/reviews")).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/reviews/1").param("reason", "Spam"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(put("/api/v1/reviews/1/reply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reply\":\"Cảm ơn\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("GET/DELETE/PUT reply đánh giá với role MANAGER thành công và bắt lỗi rỗng")
    void managerReviewActions_handleSuccessAndBlankInput() throws Exception {
        User manager = buildUser(2L, User.Role.MANAGER);
        ProductReview replied = sampleReview();
        replied.setReply("Cảm ơn bạn!");

        when(userService.getAuthenticatedUser()).thenReturn(manager);
        when(reviewService.getAllReviews()).thenReturn(List.of(replied));

        mockMvc.perform(get("/api/v1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));

        doNothing().when(reviewService).deleteReview(1L, "Vi phạm", manager);
        mockMvc.perform(delete("/api/v1/reviews/1").param("reason", "  Vi phạm  "))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/reviews/1").param("reason", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Lý do xóa không được để trống"));

        when(reviewService.replyReview(1L, "Cảm ơn bạn!", manager)).thenReturn(replied);
        mockMvc.perform(put("/api/v1/reviews/1/reply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reply", "Cảm ơn bạn!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review.reply").value("Cảm ơn bạn!"));

        mockMvc.perform(put("/api/v1/reviews/1/reply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reply", " "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Nội dung phản hồi không được để trống"));
    }
}
