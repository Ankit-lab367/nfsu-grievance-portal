const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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
    email: { type: String, required: true, unique: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function removeTestUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const emailsToRemove = ['student@test.com', 'teacher@test.com'];

        const result = await User.deleteMany({ email: { $in: emailsToRemove } });
        console.log(`Successfully removed ${result.deletedCount} test accounts.`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

removeTestUsers();
