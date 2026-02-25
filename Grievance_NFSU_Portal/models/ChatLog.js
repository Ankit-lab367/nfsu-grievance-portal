import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ChatLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        sessionId: {
            type: String,
            required: true,
        },
        messages: [MessageSchema],
        isGuest: {
            type: Boolean,
            default: false,
        },
        context: {
            type: String,
        },
        // Store any complaint lookups
        queriedComplaints: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Complaint',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for session lookup
ChatLogSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.models.ChatLog || mongoose.model('ChatLog', ChatLogSchema);
