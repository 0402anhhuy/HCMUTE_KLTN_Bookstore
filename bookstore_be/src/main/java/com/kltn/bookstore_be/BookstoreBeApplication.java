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

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BookstoreBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookstoreBeApplication.class, args);
	}

	@Bean
	public CommandLineRunner schemaUpdater(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				System.out.println("Executing schema migration: updating payment_method columns to VARCHAR(50)...");
				jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;");
				jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;");
				System.out.println("Schema migration executed successfully!");
			} catch (Exception e) {
				System.out.println("Schema migration skipped or failed (might already be applied): " + e.getMessage());
			}
			// Add timestamp columns to orders table for status tracking
			String[] columns = {"confirmed_at", "preparing_at", "shipping_at", "delivered_at", "cancelled_at", "refunded_at"};
			for (String col : columns) {
				try {
					jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN " + col + " DATETIME NULL;");
					System.out.println("Added column " + col + " to orders table.");
				} catch (Exception e) {
					// Column might already exist, ignore
				}
			}
			try {
				System.out.println("=== PRINTING ALL ORDERS IN DB ===");
				jdbcTemplate.query("SELECT id, status, payment_method, final_amount FROM orders", rs -> {
					System.out.println(String.format("Order ID: %d, Status: %s, Payment Method: %s, Final Amount: %.2f",
							rs.getLong("id"), rs.getString("status"), rs.getString("payment_method"), rs.getBigDecimal("final_amount")));
				});
				System.out.println("=================================");
			} catch (Exception e) {
				System.out.println("Failed to print orders: " + e.getMessage());
			}
		};
	}

}