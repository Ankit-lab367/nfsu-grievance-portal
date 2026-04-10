import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' } // OTP expires in 5 minutes
    }
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
