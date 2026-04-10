import mongoose from 'mongoose';
const NoticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        targetAudience: {
            type: String,
            enum: ['student', 'staff', 'both'],
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dismissedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);
NoticeSchema.index({ targetAudience: 1, createdAt: -1 });
export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);