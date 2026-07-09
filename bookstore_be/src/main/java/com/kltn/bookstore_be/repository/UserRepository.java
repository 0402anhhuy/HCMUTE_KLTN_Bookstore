package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Page<User> findByRole(User.Role role, Pageable pageable);

    Page<User> findByStatus(User.Status status, Pageable pageable);
}
