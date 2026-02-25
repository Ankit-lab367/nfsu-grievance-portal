
// Test MongoDB Standard Connection Script
const mongoose = require('mongoose');

// Standard connection string with explicit replica set members
// Original: mongodb+srv://rockysa141_db_user:Ankit_bos12@ankit.p3nvu25.mongodb.net/nfsu-grievance
const MONGODB_URI = 'mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority';

console.log('🔍 Testing Standard MongoDB Connection...\n');
console.log('Connection String:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

const testConnection = async () => {
    try {
        const startTime = Date.now();

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        const endTime = Date.now();

        console.log('✅ SUCCESS! MongoDB connected successfully!');
        console.log(`⏱️  Connection time: ${endTime - startTime}ms`);
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);

        // Try to list collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ CONNECTION FAILED!\n');
        console.error('Error Message:', error.message);
        process.exit(1);
    }
};

testConnection();
