package com.kltn.bookstore_be.audit.presentation;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<?> getAllAuditLogs() {
        try {
            return ResponseEntity.ok(auditLogService.getAllLogs());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
