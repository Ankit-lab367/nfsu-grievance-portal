import mongoose from 'mongoose';

const DirectMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

DirectMessageSchema.index({ sender: 1, receiver: 1 });
DirectMessageSchema.index({ receiver: 1, isRead: 1 });
DirectMessageSchema.index({ createdAt: -1 });

export default mongoose.models.DirectMessage || mongoose.model('DirectMessage', DirectMessageSchema);
