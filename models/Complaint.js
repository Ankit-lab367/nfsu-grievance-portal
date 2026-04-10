import mongoose from 'mongoose';
const TimelineEntrySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
    },
    remarks: String,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const ComplaintSchema = new mongoose.Schema(
    {
        complaintId: {
            type: String,
            unique: true,
            required: true,
            default: function () {
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                return `NFSU-${timestamp}-${random}`;
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
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
        category: {
            type: String,
            required: [true, 'Category is required'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'],
            default: 'Pending',
        },
        attachments: [
            {
                filename: String,
                url: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        timeline: [TimelineEntrySchema],
        resolutionDetails: {
            description: String,
            resolvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            resolvedAt: Date,
            proof: [
                {
                    filename: String,
                    url: String,
                },
            ],
        },
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            comment: String,
            submittedAt: Date,
        },
        slaBreachAlert: {
            type: Boolean,
            default: false,
        },
        escalatedAt: Date,
        tags: [String],
        viewCount: {
            type: Number,
            default: 0,
        },
        votes: {
            upvotes: { type: Number, default: 0 },
            downvotes: { type: Number, default: 0 },
            votedBy: [
                {
                    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    voteType: { type: String, enum: ['up', 'down'] },
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);
ComplaintSchema.pre('save', async function (next) {
    if (this.timeline.length === 0) {
        this.timeline.push({
            status: 'Pending',
            remarks: 'Complaint registered',
            timestamp: new Date(),
        });
    }
    next();
});
ComplaintSchema.methods.checkSLABreach = function () {
    const slaHours = {
        Critical: parseInt(process.env.SLA_CRITICAL) || 24,
        High: parseInt(process.env.SLA_HIGH) || 72,
        Medium: parseInt(process.env.SLA_MEDIUM) || 168,
        Low: parseInt(process.env.SLA_LOW) || 336,
    };
    const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
    const slaLimit = slaHours[this.priority];
    return hoursSinceCreation > slaLimit;
};
ComplaintSchema.methods.addTimelineEntry = function (status, remarks, updatedBy) {
    this.timeline.push({
        status,
        remarks,
        updatedBy,
        timestamp: new Date(),
    });
    this.status = status;
};
export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);