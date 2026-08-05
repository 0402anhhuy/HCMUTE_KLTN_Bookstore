package com.kltn.bookstore_be.ordering.presentation;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.domain.Shipper;
import com.kltn.bookstore_be.ordering.domain.ShipperRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shippers")
public class ShipperController {

    private final ShipperRepository shipperRepository;
    private final UserService userService;

    private void checkManagerOrAdmin() {
        User user = userService.getAuthenticatedUser();
        if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
            throw new RuntimeException("Bạn không có quyền thực hiện chức năng này");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllShippers() {
        try {
            checkManagerOrAdmin();
            List<Shipper> shippers = shipperRepository.findAll();
            return ResponseEntity.ok(shippers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createShipper(@RequestBody Shipper shipper) {
        try {
            checkManagerOrAdmin();
            if (shipper.getFullName() == null || shipper.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên người giao hàng không được để trống"));
            }
            if (shipper.getPhone() == null || shipper.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại không được để trống"));
            }
            String phone = shipper.getPhone().trim();
            if (shipperRepository.existsByPhone(phone)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại này đã tồn tại cho một người giao hàng khác"));
            }
            shipper.setPhone(phone);
            Shipper saved = shipperRepository.save(shipper);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShipper(@PathVariable Long id, @RequestBody Shipper details) {
        try {
            checkManagerOrAdmin();
            Shipper shipper = shipperRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Người giao hàng không tồn tại"));

            if (details.getFullName() != null) {
                if (details.getFullName().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Tên người giao hàng không được để trống"));
                }
                shipper.setFullName(details.getFullName().trim());
            }
            if (details.getPhone() != null) {
                String phone = details.getPhone().trim();
                if (phone.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại không được để trống"));
                }
                if (shipperRepository.existsByPhoneAndIdNot(phone, id)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại này đã tồn tại cho một người giao hàng khác"));
                }
                shipper.setPhone(phone);
            }
            if (details.getVehicle() != null) {
                shipper.setVehicle(details.getVehicle());
            }
            if (details.getStatus() != null) {
                shipper.setStatus(details.getStatus());
            }

            Shipper updated = shipperRepository.save(shipper);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShipper(@PathVariable Long id) {
        try {
            checkManagerOrAdmin();
            Shipper shipper = shipperRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Người giao hàng không tồn tại"));
            try {
                shipperRepository.delete(shipper);
                shipperRepository.flush();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa người giao hàng này vì đang phụ trách hoặc đã từng giao đơn hàng trong hệ thống. Hãy chuyển trạng thái người giao hàng sang tạm nghỉ."));
            }
            return ResponseEntity.ok(Map.of("message", "Đã xóa người giao hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
