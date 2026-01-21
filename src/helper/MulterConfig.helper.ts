import multer from "multer";

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,   // file limit (multipart files)
        fieldSize: 15 * 1024 * 1024,  // ✅ Base64 field limit
    },
});
