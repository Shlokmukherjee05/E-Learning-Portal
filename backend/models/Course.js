import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    instructor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price:       { type: Number, default: 0 },
    category:    { type: String, required: true },
    lessons: [
        {
            title:        { type: String, required: true },
            videoUrl:     { type: String, default: '' },
            thumbnailUrl: { type: String, default: '' },  // ← was missing
            content:      { type: String, default: '' }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
