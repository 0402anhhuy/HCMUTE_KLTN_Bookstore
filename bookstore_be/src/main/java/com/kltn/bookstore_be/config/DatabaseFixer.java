package com.kltn.bookstore_be.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE promotions MODIFY COLUMN status VARCHAR(50) NOT NULL");
            System.out.println("FIX DATABASE: Altered promotions.status to VARCHAR(50) perfectly.");
        } catch (Exception e) {
            System.err.println("FIX DATABASE ERROR: " + e.getMessage());
        }
    }
}
