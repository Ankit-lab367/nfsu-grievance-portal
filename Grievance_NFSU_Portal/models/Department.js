import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            enum: [
                'Academics',
                'Hostel',
                'IT',
                'Library',
                'Admin',
                'Finance',
                'Exam',
                'Security',
                'Others',
            ],
        },
        description: {
            type: String,
        },
        adminUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        complaintCount: {
            total: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            inProgress: { type: Number, default: 0 },
            resolved: { type: Number, default: 0 },
            escalated: { type: Number, default: 0 },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
