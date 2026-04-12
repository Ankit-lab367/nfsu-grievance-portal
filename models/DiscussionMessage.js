import mongoose from 'mongoose';

const DiscussionMessageSchema = new mongoose.Schema({
    forumType: {
        type: String,
        enum: ['student', 'admin'],
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    senderEmail: {
        type: String,
        required: true
    },
    senderAvatar: {
        type: String,
        default: null
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.models.DiscussionMessage || mongoose.model('DiscussionMessage', DiscussionMessageSchema);
