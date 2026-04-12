import mongoose from 'mongoose';

const MarketplaceItemSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // base64 or URL
        default: null
    },
    uploaderId: {
        type: String,
        required: true
    },
    uploaderName: {
        type: String,
        default: 'Anonymous'
    },
    status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available'
    }
}, {
    timestamps: true
});

export default mongoose.models.MarketplaceItem || mongoose.model('MarketplaceItem', MarketplaceItemSchema);
