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
    }
}, {
    timestamps: true
});

export default mongoose.models.LostAndFound || mongoose.model('LostAndFound', LostAndFoundSchema);
