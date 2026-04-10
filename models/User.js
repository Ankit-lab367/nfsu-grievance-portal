import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['student', 'admin', 'super-admin', 'teacher', 'staff'],
            default: 'student',
        },
        enrollmentNumber: {
            type: String,
            sparse: true,
            unique: true,
        },
        course: {
            type: String,
        },
        year: {
            type: Number,
            get: function(value) {
                if (!value || !this.createdAt) return value;
                const now = new Date();
                const createdDate = new Date(this.createdAt);
                
                // Academic cycle starts on August 1st (Month index 7)
                const currentCycle = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
                const joinCycle = createdDate.getMonth() < 7 ? createdDate.getFullYear() - 1 : createdDate.getFullYear();
                
                let yearDiff = currentCycle - joinCycle;
                if (yearDiff < 0) yearDiff = 0;
                return value + yearDiff;
            }
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
        },
        permissions: {
            canAssign: { type: Boolean, default: false },
            canResolve: { type: Boolean, default: false },
            canEscalate: { type: Boolean, default: false },
            canExport: { type: Boolean, default: false },
        },
        phone: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
        avatar: {
            type: String,
            default: '/assets/default-avatar.png',
        },
        isVerifiedID: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true }
    }
);
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(8);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};
UserSchema.methods.toJSON = function () {
    const obj = this.toObject({ getters: true, virtuals: true });
    delete obj.password;
    return obj;
};
export default mongoose.models.User || mongoose.model('User', UserSchema);