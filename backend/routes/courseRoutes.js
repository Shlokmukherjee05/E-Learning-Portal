import express from 'express';
import { createCourse, getCourses, getCourseById, getMyCourses, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCourses);
// IMPORTANT: /my-courses must come BEFORE /:id or Express matches "my-courses" as an id
router.get('/my-courses', protect, getMyCourses);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

export default router;
