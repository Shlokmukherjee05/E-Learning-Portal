import express from 'express';
// Import both in one line to avoid "already declared" error
import { registerUser, loginUser } from '../controllers/authcontrollers.js';

const router = express.Router();

// Route: POST /api/auth/register
router.post('/register', registerUser);

// Route: POST /api/auth/login
router.post('/login', loginUser);

export default router;