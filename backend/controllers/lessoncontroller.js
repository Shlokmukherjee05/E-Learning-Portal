import Course from '../models/Course.js';

// @desc    Add a lesson (with optional video + thumbnail) to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Instructor only
export const addLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Only the course's instructor can add lessons
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this course' });
        }

        const { title, content } = req.body;
        if (!title) return res.status(400).json({ message: 'Lesson title is required' });

        // Build file URLs if files were uploaded
        const videoUrl = req.files?.video
            ? `/uploads/videos/${req.files.video[0].filename}`
            : req.body.videoUrl || '';

        const thumbnailUrl = req.files?.thumbnail
            ? `/uploads/images/${req.files.thumbnail[0].filename}`
            : req.body.thumbnailUrl || '';

        const newLesson = { title, content: content || '', videoUrl, thumbnailUrl };
        course.lessons.push(newLesson);
        await course.save();

        res.status(201).json({
            message: 'Lesson added successfully',
            lesson: course.lessons[course.lessons.length - 1],
            course
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Protected (enrolled students + instructor)
export const getLessons = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).select('lessons title instructor');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course.lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a lesson
// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @access  Instructor only
export const updateLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this course' });
        }

        const lesson = course.lessons.id(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const { title, content } = req.body;
        if (title) lesson.title = title;
        if (content) lesson.content = content;

        if (req.files?.video) {
            lesson.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
        }
        if (req.files?.thumbnail) {
            lesson.thumbnailUrl = `/uploads/images/${req.files.thumbnail[0].filename}`;
        }

        await course.save();
        res.json({ message: 'Lesson updated', lesson });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a lesson
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Instructor only
export const deleteLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this course' });
        }

        course.lessons = course.lessons.filter(
            l => l._id.toString() !== req.params.lessonId
        );
        await course.save();

        res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
