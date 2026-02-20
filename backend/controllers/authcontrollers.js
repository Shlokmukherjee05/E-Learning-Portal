import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // ✅ Do NOT manually hash here — the User model's pre('save') hook does it
        const user = await User.create({
            name,
            email,
            password,   // plain password → pre('save') hashes it once
            role: role || 'student'
        });

        if (user) {
            res.status(201).json({
                message: "User registered successfully",
                token: generateToken(user._id, user.role),
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // ✅ Use the model's matchPassword method, not bcrypt.compare directly
        if (user && (await user.matchPassword(password))) {
            res.json({
                message: "Login successful",
                token: generateToken(user._id, user.role),
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};