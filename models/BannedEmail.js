import mongoose from 'mongoose';

const BannedEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    bannedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        default: 'Security Violation during Student Registration'
    }
});

export default mongoose.models.BannedEmail || mongoose.model('BannedEmail', BannedEmailSchema);
