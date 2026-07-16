package com.kltn.bookstore_be.common;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UploadController {

    private final Path root = Paths.get("uploads");
    private final CloudinaryService cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "bookstore_products") String folder,
            @RequestParam(value = "filename", required = false) String filename) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn một tệp tin để tải lên."));
            }

            if (cloudinaryService.isCloudinaryConfigured()) {
                String cloudUrl = cloudinaryService.uploadFile(file, folder, filename);
                return ResponseEntity.ok(Map.of("url", cloudUrl));
            }

            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(newFilename));

            String fileUrl = "http://localhost:8081/uploads/" + newFilename;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Không thể tải lên tệp: " + e.getMessage()));
        }
    }
}
