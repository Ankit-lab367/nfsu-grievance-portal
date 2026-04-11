import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Simple manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            });
        }
    } catch (err) {
        console.error('Error loading .env.local:', err);
    }
}

loadEnv();

async function makeSuperAdmin(email) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('Error: MONGODB_URI not found.');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to database.');

        const User = mongoose.connection.collection('users');
        
        const result = await User.updateOne(
            { email: email.toLowerCase() },
            { 
                $set: { 
                    isActive: true, 
                    role: 'super-admin',
                    isVerifiedID: true,
                    permissions: {
                        canAssign: true,
                        canResolve: true,
                        canEscalate: true,
                        canExport: true
                    }
                } 
            }
        );

        if (result.matchedCount > 0) {
            console.log(`Successfully activated and promoted ${email} to Super Admin! 👑`);
        } else {
            console.log(`User ${email} not found. Please make sure you registered first.`);
        }

    } catch (error) {
        console.error('Activation failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

// Get email from command line or hardcode from screenshot
const targetEmail = process.argv[2] || 'rockysa141@gmail.com';
makeSuperAdmin(targetEmail);
