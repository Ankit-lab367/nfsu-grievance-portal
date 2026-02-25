import mongoose from 'mongoose';

const AcademicResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title/subject'],
    },
    description: {
        type: String,
    },
    degree: {
        type: String,
        required: true, // e.g., 'btech', 'bsc', 'msc'
    },
    semester: {
        type: String,
        required: true, // e.g., '1', '2'
    },
    type: {
        type: String,
        required: true,
        enum: ['notes', 'pyq', 'books'],
    },
    fileUrl: {
        type: String,
        required: [true, 'Please provide a file URL'],
    },
    fileType: {
        type: String, // 'pdf', 'image', etc.
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.AcademicResource || mongoose.model('AcademicResource', AcademicResourceSchema);
