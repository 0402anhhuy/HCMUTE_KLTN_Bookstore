package com.kltn.bookstore_be;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.catalog.application.*;
import com.kltn.bookstore_be.ordering.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@Slf4j
@SpringBootApplication
public class BookstoreBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookstoreBeApplication.class, args);
    }

    @Bean
    @org.springframework.core.annotation.Order(1)
    public CommandLineRunner schemaUpdater(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                log.info("Executing schema migration: updating payment_method and discount_type columns to VARCHAR(50)...");
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;");
                jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;");
                jdbcTemplate.execute("ALTER TABLE coupon_codes MODIFY COLUMN discount_type VARCHAR(50) NOT NULL;");
                log.info("Schema migration executed successfully!");
            } catch (Exception e) {
                log.debug("Schema migration skipped or failed (might already be applied): {}", e.getMessage());
            }
            // Add timestamp columns to orders table for status tracking
            String[] columns = {"confirmed_at", "preparing_at", "shipping_at", "delivered_at", "cancelled_at", "refunded_at"};
            for (String col : columns) {
                try {
                    jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN " + col + " DATETIME NULL;");
                    log.info("Added column {} to orders table.", col);
                } catch (Exception e) {
                    log.debug("Column {} already exists or skipped: {}", col, e.getMessage());
                }
            }
            try {
                Integer orderCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
                log.debug("Startup order count verified: {}", orderCount);
            } catch (Exception e) {
                log.debug("Failed to count orders at startup: {}", e.getMessage());
            }
        };
    }

}