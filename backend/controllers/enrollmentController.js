import Enrollment from '../models/Enrollment.js';

// @desc    Enroll in a course
// @route   POST /api/enrollments/enroll
export const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required' });
        }

        const enrollment = await Enrollment.create({
            student: req.user._id,   // ✅ fixed: was req.user.id
            course: courseId
        });

        // Populate course details so frontend gets full object immediately
        const populated = await Enrollment.findById(enrollment._id)
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name email' }
            });

        res.status(201).json({ message: 'Successfully enrolled!', enrollment: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You are already enrolled in this course.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's enrolled courses
// @route   GET /api/enrollments/my-courses
export const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id }) // ✅ fixed
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name email' }  // ✅ nested populate so instructor.name works
            });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get all enrollments for instructor's courses
// @route   GET /api/enrollments/instructor-stats
export const getInstructorEnrollments = async (req, res) => {
    try {
        const Course = (await import('../models/Course.js')).default;

        // Get all courses by this instructor
        const courses = await Course.find({ instructor: req.user._id }).select('_id title category');
        const courseIds = courses.map(c => c._id);

        // Get all enrollments for those courses
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email')
            .populate('course', 'title category')
            .sort({ enrolledAt: -1 });

        // Build per-course counts
        const perCourse = courses.map(c => ({
            courseId: c._id,
            title: c.title,
            category: c.category,
            count: enrollments.filter(e => e.course?._id?.toString() === c._id.toString()).length
        }));

        res.json({
            totalEnrollments: enrollments.length,
            totalCourses: courses.length,
            perCourse,
            enrollments  // full list with student details
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
