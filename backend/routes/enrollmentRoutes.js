import express from 'express';
import { enrollInCourse, getMyCourses, getInstructorEnrollments } from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/enroll', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);
router.get('/instructor-stats', protect, authorize('instructor', 'admin'), getInstructorEnrollments);

export default router;
