import mongoose from 'mongoose';

const GroupMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatGroup',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        attachments: [
            {
                url: String,
                type: String, // 'image' or 'file'
                name: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

GroupMessageSchema.index({ groupId: 1, createdAt: 1 });

export default mongoose.models.GroupMessage || mongoose.model('GroupMessage', GroupMessageSchema);
