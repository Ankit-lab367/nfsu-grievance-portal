
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let JWT_SECRET = '';
for (const line of envLines) {
    if (line.startsWith('JWT_SECRET=')) {
        JWT_SECRET = line.substring('JWT_SECRET='.length).trim();
        break;
    }
}

if (!JWT_SECRET) {
    console.error('JWT_SECRET not found');
    process.exit(1);
}

const user = {
    id: '698721bb69aa6e7219eadf0a',
    email: 'ro.123@gmail.com',
    role: 'student',
    name: '676756'
};

const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

console.log('Generated token:', token);
console.log('Testing complaint submission...');

async function testSubmission() {
    try {
        const formData = new FormData();
        formData.append('title', 'Test Complaint ' + Date.now());
        formData.append('description', 'This is a test complaint description');
        formData.append('department', 'Academics');
        formData.append('category', 'Course Content');
        formData.append('priority', 'Medium');
        formData.append('isAnonymous', 'false');

        const response = await axios.post('http://localhost:3001/api/complaints/create', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Axios with FormData usually sets Content-Type automatically, but sometimes needs help in Node
            }
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSubmission();
