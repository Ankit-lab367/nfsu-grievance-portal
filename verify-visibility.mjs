
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
        JWT_SECRET = line.split('=')[1].trim();
        break;
    }
}

if (!JWT_SECRET) {
    console.error('JWT_SECRET not found');
    process.exit(1);
}

const userA = {
    id: '698721bb69aa6e7219eadf0a',
    email: 'studentA@test.com',
    role: 'student',
    name: 'Student A'
};

const userB = {
    id: '698721bb69aa6e7219eadf0b',
    email: 'studentB@test.com',
    role: 'student',
    name: 'Student B'
};

const tokenA = jwt.sign(userA, JWT_SECRET, { expiresIn: '1h' });
const tokenB = jwt.sign(userB, JWT_SECRET, { expiresIn: '1h' });

const API_BASE = 'http://localhost:3000'; // Adjust if different

async function runTest() {
    try {
        console.log('--- RUNNING VISIBILITY TEST ---');

        // 1. User A lists complaints (should succeed)
        console.log('1. User A fetching complaints...');
        const res1 = await axios.get(`${API_BASE}/api/complaints/get`, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log(`   Success: ${res1.data.success}, Count: ${res1.data.complaints.length}`);

        // 2. User B fetching complaints
        console.log('2. User B fetching complaints (should see User A\'s or others if they exist)...');
        const res2 = await axios.get(`${API_BASE}/api/complaints/get`, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        console.log(`   Success: ${res2.data.success}, Count: ${res2.data.complaints.length}`);

        // 3. Test Detail View
        if (res1.data.complaints.length > 0) {
            const firstComplaint = res1.data.complaints[0];
            const complaintId = firstComplaint.complaintId;
            const ownerId = firstComplaint.userId?._id || firstComplaint.userId;

            console.log(`3. Testing detail view for complaint ${complaintId} (Owner: ${ownerId})`);

            // User B (who is not the owner) tries to view it
            console.log(`   User B (Non-owner) fetching details...`);
            try {
                const res3 = await axios.get(`${API_BASE}/api/complaints/${complaintId}`, {
                    headers: { Authorization: `Bearer ${tokenB}` }
                });
                console.log(`   Success! User B can see User A's complaint details.`);
            } catch (err) {
                console.error(`   FAILED: User B could NOT see User A's complaint details: ${err.response?.data?.error || err.message}`);
                process.exit(1);
            }
        } else {
            console.log('   No complaints found to test detail view. Please create one first.');
        }

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('Test error:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
