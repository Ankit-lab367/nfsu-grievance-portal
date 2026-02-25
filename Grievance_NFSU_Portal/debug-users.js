
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
    name: String,
    email: String,
    role: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('Users found:', users.length);
        console.log(users);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
