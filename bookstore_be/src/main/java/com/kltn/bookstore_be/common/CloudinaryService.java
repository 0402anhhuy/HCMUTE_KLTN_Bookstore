package com.kltn.bookstore_be.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    public String uploadFile(MultipartFile file, String folderName) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary chưa được cấu hình (thiếu cloud-name trong application.properties).");
        }
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folderName,
                "resource_type", "auto"
        ));
        Object secureUrl = uploadResult.get("secure_url");
        if (secureUrl != null) {
            return secureUrl.toString();
        }
        return uploadResult.get("url").toString();
    }
}
