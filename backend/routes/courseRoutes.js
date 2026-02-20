import express from 'express';
import { createCourse, getCourses } from '../controllers/courseController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/', getCourses);
router.post('/', protect, createCourse); // 'protect' checks if the user is logged in

export default router;