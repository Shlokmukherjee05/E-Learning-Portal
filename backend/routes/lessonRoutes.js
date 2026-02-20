import express from 'express';
import { addLesson, getLessons, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadLessonFiles } from '../middlewares/uploadMiddleware.js';

const router = express.Router({ mergeParams: true });

// Single middleware that handles both 'video' and 'thumbnail' fields
const uploadFields = uploadLessonFiles.fields([
    { name: 'video',     maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

const handleUpload = (req, res, next) => {
    uploadFields(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

// GET  /api/courses/:courseId/lessons
router.get('/',protect,getLessons);

// POST /api/courses/:courseId/lessons
router.post('/',protect, authorize('instructor'), handleUpload, addLesson);

// PUT  /api/courses/:courseId/lessons/:lessonId
router.put('/:lessonId',protect, authorize('instructor'), handleUpload, updateLesson);

// DELETE /api/courses/:courseId/lessons/:lessonId
router.delete('/:lessonId',protect,authorize('instructor'),deleteLesson);

export default router;
