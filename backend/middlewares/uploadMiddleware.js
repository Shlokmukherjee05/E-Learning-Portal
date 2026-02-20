import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
['uploads/videos', 'uploads/images'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Storage: routes file to correct folder based on fieldname ───────
const combinedStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video') {
            cb(null, 'uploads/videos/');
        } else {
            cb(null, 'uploads/images/');
        }
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const prefix = file.fieldname === 'video' ? 'video' : 'image';
        cb(null, `${prefix}-${unique}${path.extname(file.originalname)}`);
    }
});

// ── Single filter that accepts both videos AND images ───────────────
const combinedFilter = (req, file, cb) => {
    const videoExts  = /mp4|mkv|webm|mov|avi/;
    const imageExts  = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (file.fieldname === 'video') {
        if (videoExts.test(ext) || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Video field only accepts video files (mp4, webm, mkv, mov, avi)'));
        }
    } else if (file.fieldname === 'thumbnail') {
        if (imageExts.test(ext) || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Thumbnail field only accepts image files (jpg, png, gif, webp)'));
        }
    } else {
        cb(null, true); // allow unknown fields through
    }
};

// ── Single multer instance that handles both fields ─────────────────
export const uploadLessonFiles = multer({
    storage: combinedStorage,
    fileFilter: combinedFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB covers both videos and images
    }
});
