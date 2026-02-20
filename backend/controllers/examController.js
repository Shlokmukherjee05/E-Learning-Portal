import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';

// @desc    Create an exam (Instructor only)
// @route   POST /api/exams/create
export const createExam = async (req, res) => {
    try {
        const { course, title, questions } = req.body;
        const exam = await Exam.create({ course, title, questions });
        const populated = await Exam.findById(exam._id).populate('course', 'title');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all exams created by the logged-in instructor
// @route   GET /api/exams/my-exams
export const getMyExams = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id }).select('_id title');
        const courseIds = courses.map(c => c._id);
        const exams = await Exam.find({ course: { $in: courseIds } })
            .populate('course', 'title category')
            .sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get exam by course ID (safe - no correct answers)
// @route   GET /api/exams/course/:courseId
export const getExamByCourse = async (req, res) => {
    try {
        const exam = await Exam.findOne({ course: req.params.courseId });
        if (!exam) return res.status(404).json({ message: 'No exam found for this course' });

        // Strip correctAnswer so students cannot cheat via network inspection
        const safeExam = {
            _id: exam._id,
            title: exam.title,
            course: exam.course,
            questions: exam.questions.map(q => ({
                _id: q._id,
                questionText: q.questionText,
                options: q.options
                // correctAnswer intentionally excluded
            }))
        };
        res.json(safeExam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit an exam and get a result
// @route   POST /api/exams/submit
export const submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;

        if (!examId || !answers) {
            return res.status(400).json({ message: 'examId and answers are required' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        let score = 0;
        exam.questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) score++;
        });

        const result = await Result.create({
            student: req.user._id,   // ✅ fixed: was req.user.id
            exam: examId,
            score,
            totalQuestions: exam.questions.length,
            passed: (score / exam.questions.length) >= 0.5
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
