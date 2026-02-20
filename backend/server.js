import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route Imports
import authRoutes       from './routes/authRoutes.js';
import courseRoutes     from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import examRoutes       from './routes/examRoutes.js';
import resultRoutes     from './routes/resultRoutes.js';
import lessonRoutes     from './routes/lessonRoutes.js';

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Serve uploaded videos and images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',        authRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/exams',       examRoutes);
app.use('/api/results',     resultRoutes);
app.use('/api/courses/:courseId/lessons', lessonRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
