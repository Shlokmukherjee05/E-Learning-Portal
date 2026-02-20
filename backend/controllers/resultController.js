import Result from '../models/Result.js';

// @desc    Get logged-in user's results
// @route   GET /api/results/my-results
export const getMyResults = async (req, res) => {
    try {
        // Find all results belonging to the student and populate the exam and course details
        const results = await Result.find({ student: req.user._id })
            .populate({
                path: 'exam',
                select: 'title course',
                populate: {
                    path: 'course',
                    select: 'title'
                }
            });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all results for a specific exam (Instructor/Admin only)
// @route   GET /api/results/exam/:examId
export const getExamResults = async (req, res) => {
    try {
        const results = await Result.find({ exam: req.params.examId })
            .populate('student', 'name email');
            
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};