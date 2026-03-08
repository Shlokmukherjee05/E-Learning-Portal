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

// @desc    Get all exam results for instructor's courses
// @route   GET /api/results/instructor-stats
export const getInstructorExamStats = async (req, res) => {
    try {
        const Course = (await import('../models/Course.js')).default;
        const Exam = (await import('../models/Exam.js')).default;

        // Get instructor's courses
        const courses = await Course.find({ instructor: req.user._id }).select('_id title');
        const courseIds = courses.map(c => c._id);

        // Get exams for those courses
        const exams = await Exam.find({ course: { $in: courseIds } }).select('_id title course');
        const examIds = exams.map(e => e._id);

        // Get all results for those exams
        const results = await Result.find({ exam: { $in: examIds } })
            .populate('student', 'name email')
            .populate({
                path: 'exam',
                select: 'title course',
                populate: { path: 'course', select: 'title' }
            })
            .sort({ createdAt: -1 });

        // Per-exam summary
        const perExam = exams.map(ex => {
            const examResults = results.filter(r => r.exam?._id?.toString() === ex._id.toString());
            const passed = examResults.filter(r => r.passed).length;
            return {
                examId: ex._id,
                title: ex.title,
                courseId: ex.course,
                count: examResults.length,
                passed,
                failed: examResults.length - passed
            };
        });

        res.json({
            totalExamsTaken: results.length,
            totalExams: exams.length,
            perExam,
            results  // full list with student details
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
