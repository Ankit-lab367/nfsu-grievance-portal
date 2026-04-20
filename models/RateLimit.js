import mongoose from 'mongoose';

const rateLimitSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        index: true
    },
    endpoint: {
        type: String,
        required: true,
        index: true
    },
    count: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 
    }
});


rateLimitSchema.index({ ip: 1, endpoint: 1 });

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);
export default RateLimit;
