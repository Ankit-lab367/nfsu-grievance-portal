import mongoose from 'mongoose';
const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['complaint', 'status_update', 'assignment', 'resolution', 'escalation', 'feedback'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        complaintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
    },
    {
        timestamps: true,
    }
);
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);