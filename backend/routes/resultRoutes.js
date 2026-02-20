import express from 'express';
import { getMyResults, getExamResults } from '../controllers/resultController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Student routes
router.get('/my-results', protect, getMyResults);

// Instructor/Admin routes
router.get('/exam/:examId', protect, authorize('instructor', 'admin'), getExamResults);

export default router;