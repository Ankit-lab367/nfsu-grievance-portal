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
    role: { type: String, enum: ['student', 'admin', 'super-admin', 'teacher'], default: 'student' },
    phone: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createTestUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const testUsers = [
            {
                name: 'Test Student',
                email: 'student@test.com',
                password: hashedPassword,
                role: 'student',
                phone: '1234567890'
            },
            {
                name: 'Test Teacher',
                email: 'teacher@test.com',
                password: hashedPassword,
                role: 'teacher',
                phone: '0987654321'
            }
        ];

        for (const userData of testUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                await User.create(userData);
                console.log(`Created ${userData.role}: ${userData.email}`);
            } else {
                console.log(`${userData.role} already exists: ${userData.email}`);
            }
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

createTestUsers();
