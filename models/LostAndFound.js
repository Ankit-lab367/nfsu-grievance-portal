import mongoose from 'mongoose';

const LostAndFoundSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // base64 or URL
        default: null
    },
    uploaderId: {
        type: String,
        required: true
    },
    uploaderName: {
        type: String,
        default: 'Anonymous'
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    comments: [
        {
            user: { type: String, required: true },
            avatar: { type: String, default: null },
            text: { type: String, required: true },
            upvotes: { type: Number, default: 0 },
            downvotes: { type: Number, default: 0 },
            timestamp: { type: Date, default: Date.now },
            votedBy: [
                {
                    userId: { type: String, required: true },
                    voteType: { type: String, enum: ['up', 'down'] },
                }
            ]
        }
    ]
}, {
    timestamps: true
});

export default mongoose.models.LostAndFound || mongoose.model('LostAndFound', LostAndFoundSchema);
