// create-admin.js
// Run: node create-admin.js
// Creates a super-admin user in MongoDB so you can login

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let MONGODB_URI = '';
for (const line of envContent.split('\n')) {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.substring('MONGODB_URI='.length).trim();
        break;
    }
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'super-admin', 'teacher', 'staff'], default: 'student' },
    phone: String,
    isActive: { type: Boolean, default: true },
    faceVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmins() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB:', MONGODB_URI);

        const password = 'admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const admins = [
            {
                name: 'Super Admin',
                email: 'superadmin@nfsu.ac.in',
                password: hashedPassword,
                role: 'super-admin',
                phone: '9999999999',
            },
            {
                name: 'Department Admin',
                email: 'admin@nfsu.ac.in',
                password: hashedPassword,
                role: 'admin',
                phone: '8888888888',
            },
        ];

        for (const admin of admins) {
            const existing = await User.findOne({ email: admin.email });
            if (existing) {
                console.log(`⚠️  Already exists: ${admin.email} (role: ${admin.role})`);
            } else {
                await User.create(admin);
                console.log(`✅ Created ${admin.role}: ${admin.email} | Password: ${password}`);
            }
        }

        console.log('\n──────────────────────────────────────────');
        console.log('🔐 Admin Login Credentials');
        console.log('──────────────────────────────────────────');
        console.log('Super Admin  →  superadmin@nfsu.ac.in  |  admin@123');
        console.log('Admin        →  admin@nfsu.ac.in       |  admin@123');
        console.log('──────────────────────────────────────────\n');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmins();
