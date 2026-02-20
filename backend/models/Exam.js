import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    questions: [
        {
            questionText: String,
            options: [String],
            correctAnswer: Number // Index of the correct option (0, 1, 2, etc.)
        }
    ]
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);