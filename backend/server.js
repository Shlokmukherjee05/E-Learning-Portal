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

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root health check
app.get('/', (req, res) => {
    res.json({ message: 'API is running', version: '1.0.0' });
});

// API Routes
app.use('/api/auth',        authRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/exams',       examRoutes);
app.use('/api/results',     resultRoutes);
app.use('/api/courses/:courseId/lessons', lessonRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler (4 args required for Express error middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
