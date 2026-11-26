package com.kltn.bookstore_be.common;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(@Autowired(required = false) Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public boolean isCloudinaryConfigured() {
        return cloudinary != null;
    }

    public String uploadFile(MultipartFile file, String folderName, String customFilename) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary chưa được cấu hình (thiếu cloud-name trong application.properties).");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("folder", folderName);
        params.put("use_filename", true);
        params.put("unique_filename", false);
        params.put("resource_type", "auto");
        if (customFilename != null && !customFilename.isBlank()) {
            params.put("public_id", customFilename);
        }
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        Object secureUrl = uploadResult.get("secure_url");
        if (secureUrl != null) {
            return secureUrl.toString();
        }
        return uploadResult.get("url").toString();
    }
}
