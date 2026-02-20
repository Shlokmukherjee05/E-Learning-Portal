import express from 'express';
import { enrollInCourse, getMyCourses } from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/enroll', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);

export default router;