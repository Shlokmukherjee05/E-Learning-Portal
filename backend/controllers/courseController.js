import Course from '../models/Course.js';

// @desc    Create a new course
export const createCourse = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            category,
            instructor: req.user.id // Taken from the protect middleware
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};