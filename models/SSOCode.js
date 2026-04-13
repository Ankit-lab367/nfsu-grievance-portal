import mongoose from 'mongoose';

const SSOCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Automatically delete after 5 minutes (300 seconds)
    }
});

const SSOCode = mongoose.models.SSOCode || mongoose.model('SSOCode', SSOCodeSchema);
export default SSOCode;
