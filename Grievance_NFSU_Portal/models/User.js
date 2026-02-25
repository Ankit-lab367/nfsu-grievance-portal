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
        // Student-specific fields
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
        },
        // Admin-specific fields
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
        // Common fields
        phone: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        faceVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },
        avatar: {
            type: String,
            default: '/assets/default-avatar.png',
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
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

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
