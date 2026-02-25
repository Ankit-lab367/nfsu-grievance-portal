import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 50,
            minPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB connection failed:', e.message);

        if (e.message.includes('querySrv ECONNREFUSED') || e.message.includes('ECONNREFUSED')) {
            console.error('\n🔧 TROUBLESHOOTING STEPS:');
            console.error('1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
            console.error('2. Navigate to Network Access in the left sidebar');
            console.error('3. Click "Add IP Address"');
            console.error('4. Either:');
            console.error('   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development');
            console.error('   - Or add your current IP address');
            console.error('5. Make sure your MongoDB cluster is not paused');
            console.error('6. Verify your username and password in .env.local\n');
        }

        throw e;
    }

    return cached.conn;
}

export default dbConnect;
