import express from 'express';
import { createExam, getMyExams, getExamByCourse, submitExam } from '../controllers/examController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Instructor: create an exam
router.post('/create',           protect, authorize('instructor', 'admin'), createExam);

// Instructor: view all their exams with IDs
router.get('/my-exams',          protect, authorize('instructor', 'admin'), getMyExams);

// Student: fetch exam for a course (no correct answers returned)
router.get('/course/:courseId',  protect, getExamByCourse);

// Student: submit answers
router.post('/submit',           protect, submitExam);

export default router;
