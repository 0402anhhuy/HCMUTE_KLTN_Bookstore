export const MAX_EVIDENCE_FILE_BYTES = 20 * 1024 * 1024;
export const COMPRESSION_THRESHOLD_BYTES = 900 * 1024;
const MAX_DIMENSION_PX = 1600;

export const validateEvidenceFile = (file) => {
    if (!file) {
        return { valid: false, error: "Vui lòng chọn tệp ảnh hợp lệ." };
    }
    if (file.type && !file.type.startsWith("image/")) {
        return { valid: false, error: "Chỉ hỗ trợ tải lên định dạng tệp ảnh." };
    }
    if (typeof file.size === "number" && file.size > MAX_EVIDENCE_FILE_BYTES) {
        return {
            valid: false,
            error: "Ảnh vượt quá giới hạn 20MB. Vui lòng chọn ảnh có dung lượng nhỏ hơn.",
        };
    }
    return { valid: true };
};

export const shouldCompressImage = (file) =>
    Boolean(
        file &&
            file.type &&
            file.type.startsWith("image/") &&
            file.type !== "image/gif" &&
            typeof file.size === "number" &&
            file.size > COMPRESSION_THRESHOLD_BYTES,
    );

const canvasToBlob = (canvas, type, quality) =>
    new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
    });

const loadImageFromFile = (file) =>
    new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };
        img.src = objectUrl;
    });

export const prepareEvidenceFileForUpload = async (file) => {
    if (!shouldCompressImage(file) || typeof document === "undefined") {
        return file;
    }

    try {
        const img = await loadImageFromFile(file);
        const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(img.width || 1, img.height || 1));
        const targetWidth = Math.max(1, Math.round((img.width || 1) * scale));
        const targetHeight = Math.max(1, Math.round((img.height || 1) * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return file;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        let blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
        if (blob && blob.size > COMPRESSION_THRESHOLD_BYTES) {
            const tighterBlob = await canvasToBlob(canvas, "image/jpeg", 0.65);
            if (tighterBlob && tighterBlob.size < blob.size) {
                blob = tighterBlob;
            }
        }

        if (!blob || blob.size >= file.size) {
            return file;
        }

        const baseName = (file.name || "evidence").replace(/\.[^.]+$/, "");
        return new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
        });
    } catch {
        return file;
    }
};
