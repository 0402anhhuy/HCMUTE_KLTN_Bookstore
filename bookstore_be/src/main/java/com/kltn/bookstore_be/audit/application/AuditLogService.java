package com.kltn.bookstore_be.audit.application;

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
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;
import com.kltn.bookstore_be.audit.domain.AuditLog;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.audit.domain.AuditLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String action, String description) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .description(description)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream().map(log -> {
            String desc = log.getDescription();
            // Since the existing AuditLog entity only stores action+desc, we pass desc directly as entityName
            // to show it on the frontend "Đối tượng" column for admin readability.
            return AuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .description(desc)
                .entityName(desc)
                .entityId("-")
                .username(log.getUser() != null ? log.getUser().getFullName() : "Hệ thống")
                .createdAt(log.getCreatedAt())
                .build();
        }).collect(Collectors.toList());
    }
}