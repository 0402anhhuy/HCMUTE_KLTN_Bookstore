package com.kltn.bookstore_be.identity.infrastructure;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(
                jwtTokenProvider,
                "jwtSecret",
                "test_jwt_secret_key_must_be_at_least_64_characters_long_for_hs512_algo_2026"
        );
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 60000L);
    }

    @Test
    @DisplayName("Sinh token từ Authentication (thường và rememberMe), giải mã email và xác thực hợp lệ")
    void generateAndValidateToken_fromAuthentication_succeeds() {
        UserDetails principal = new User("reader@example.com", "secret", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String normalToken = jwtTokenProvider.generateToken(auth);
        String rememberedToken = jwtTokenProvider.generateToken(auth, true);

        assertTrue(jwtTokenProvider.validateToken(normalToken));
        assertTrue(jwtTokenProvider.validateToken(rememberedToken));
        assertEquals("reader@example.com", jwtTokenProvider.getEmailFromJWT(normalToken));
        assertEquals("reader@example.com", jwtTokenProvider.getEmailFromJWT(rememberedToken));
    }

    @Test
    @DisplayName("Sinh token từ email và từ chối token sai định dạng, rỗng hoặc hết hạn")
    void generateFromEmail_andRejectInvalidTokens() {
        String emailToken = jwtTokenProvider.generateTokenFromEmail("direct@example.com");
        assertTrue(jwtTokenProvider.validateToken(emailToken));
        assertEquals("direct@example.com", jwtTokenProvider.getEmailFromJWT(emailToken));

        assertFalse(jwtTokenProvider.validateToken("not.a.valid.jwt"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));

        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", -1000L);
        String expiredToken = jwtTokenProvider.generateTokenFromEmail("expired@example.com");
        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }
}
