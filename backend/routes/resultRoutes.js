import express from 'express';
import { getMyResults, getExamResults, getInstructorExamStats } from '../controllers/resultController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-results', protect, getMyResults);
router.get('/instructor-stats', protect, authorize('instructor', 'admin'), getInstructorExamStats);
router.get('/exam/:examId', protect, authorize('instructor', 'admin'), getExamResults);

export default router;
