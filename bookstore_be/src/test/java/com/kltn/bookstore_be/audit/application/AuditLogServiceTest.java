package com.kltn.bookstore_be.audit.application;

import com.kltn.bookstore_be.audit.domain.AuditLog;
import com.kltn.bookstore_be.audit.domain.AuditLogRepository;
import com.kltn.bookstore_be.identity.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @InjectMocks
    private AuditLogService auditLogService;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("log lưu bản ghi AuditLog với user, action và description")
    void log_savesAuditLog() {
        User admin = User.builder().id(1L).fullName("Admin").build();

        auditLogService.log(admin, "UPDATE_ORDER", "Cập nhật trạng thái đơn #1");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        assertEquals("UPDATE_ORDER", captor.getValue().getAction());
        assertEquals("Cập nhật trạng thái đơn #1", captor.getValue().getDescription());
        assertEquals(admin, captor.getValue().getUser());
    }

    @Test
    @DisplayName("getLogsByUser và getAllLogs map đúng user và fallback 'Hệ thống'")
    void queryLogs_mapsUserAndSystemFallback() {
        User user = User.builder().id(2L).fullName("Nguyen Manager").build();
        AuditLog withUser = AuditLog.builder()
                .id(1L)
                .user(user)
                .action("CREATE_BOOK")
                .description("Thêm sách A")
                .createdAt(LocalDateTime.now())
                .build();
        AuditLog systemLog = AuditLog.builder()
                .id(2L)
                .user(null)
                .action("AUTO_SYNC")
                .description("Đồng bộ tự động")
                .createdAt(LocalDateTime.now())
                .build();

        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(withUser));
        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(withUser, systemLog));

        assertEquals(1, auditLogService.getLogsByUser(2L).size());

        List<AuditLogResponse> responses = auditLogService.getAllLogs();
        assertEquals(2, responses.size());
        assertEquals("Nguyen Manager", responses.get(0).getUsername());
        assertEquals("Hệ thống", responses.get(1).getUsername());
        assertEquals("Đồng bộ tự động", responses.get(1).getEntityName());
    }
}
