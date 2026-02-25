const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Manually read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let MONGODB_URI = '';
for (const line of envLines) {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.substring('MONGODB_URI='.length).trim();
        break;
    }
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createTargetUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('password123', 10);
        const email = 'target@test.com';

        const existing = await User.findOne({ email });
        if (existing) await User.deleteOne({ email });

        await User.create({
            name: 'Target Unit',
            email,
            password: hashedPassword,
            role: 'student',
            isActive: true
        });

        console.log('Target unit created: target@test.com');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

createTargetUser();
