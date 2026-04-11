import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load .env.local
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
                    const key = trimmed.substring(0, eqIndex).trim();
                    const value = trimmed.substring(eqIndex + 1).trim();
                    process.env[key] = value;
                }
            });
        }
    } catch (err) {
        console.error('Error loading .env.local:', err);
    }
}

loadEnv();

async function fixEnrollmentIndex() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found.');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to database.');

        const usersCollection = mongoose.connection.collection('users');
        
        // List current indexes
        const indexes = await usersCollection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach(idx => console.log(' -', JSON.stringify(idx)));

        // Drop the old non-sparse enrollmentNumber index if it exists
        const hasOldIndex = indexes.some(
            idx => idx.name === 'enrollmentNumber_1' && !idx.sparse
        );

        if (hasOldIndex) {
            console.log('\n⚠️  Found non-sparse enrollmentNumber index. Dropping it...');
            await usersCollection.dropIndex('enrollmentNumber_1');
            console.log('✅ Old index dropped!');
        } else {
            console.log('\n✅ No problematic index found. Recreating to ensure sparse...');
            try {
                await usersCollection.dropIndex('enrollmentNumber_1');
                console.log('✅ Old index dropped!');
            } catch (e) {
                console.log('ℹ️  Index did not exist, skipping drop.');
            }
        }

        // Recreate the correct sparse+unique index
        await usersCollection.createIndex(
            { enrollmentNumber: 1 },
            { unique: true, sparse: true, name: 'enrollmentNumber_1' }
        );
        console.log('✅ Correct sparse+unique index created!');
        console.log('\n🎉 Staff registration will now work correctly!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixEnrollmentIndex();
