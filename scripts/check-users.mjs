import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const eqIndex = trimmed.indexOf('=');
                if (eqIndex > 0) {
                    process.env[trimmed.substring(0, eqIndex).trim()] = trimmed.substring(eqIndex + 1).trim();
                }
            });
        }
    } catch (err) { console.error(err); }
}
loadEnv();

async function checkUsers() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const users = mongoose.connection.collection('users');
    
    // Show all users and their roles
    const all = await users.find({}, { projection: { name: 1, email: 1, role: 1, isActive: 1, enrollmentNumber: 1 } }).toArray();
    
    console.log(`📋 Total users in DB: ${all.length}\n`);
    all.forEach(u => {
        console.log(`  ${u.role.toUpperCase().padEnd(12)} | ${u.isActive ? '✅ Active' : '❌ Inactive'} | ${u.name} | ${u.email} | enrollNum: ${u.enrollmentNumber || 'N/A'}`);
    });

    await mongoose.disconnect();
    process.exit(0);
}
checkUsers().catch(e => { console.error(e); process.exit(1); });
