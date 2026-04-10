// Test MongoDB Connection Script
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}
console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); 
console.log('\nAttempting to connect...\n');
const testConnection = async () => {
    try {
        const startTime = Date.now();
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, 
            socketTimeoutMS: 45000,
        });
        const endTime = Date.now();
        console.log('✅ SUCCESS! MongoDB connected successfully!');
        console.log(`⏱️  Connection time: ${endTime - startTime}ms`);
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        if (collections.length > 0) {
            console.log('   Collections:', collections.map(c => c.name).join(', '));
        }
        await mongoose.connection.close();
        console.log('\n✅ Connection test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ CONNECTION FAILED!\n');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n🔧 LIKELY CAUSES:');
            console.error('1. MongoDB cluster is PAUSED or DELETED');
            console.error('   → Go to MongoDB Atlas and check cluster status');
            console.error('   → Click "Resume" if paused');
            console.error('\n2. Incorrect connection string');
            console.error('   → Get a fresh connection string from MongoDB Atlas');
            console.error('   → Database → Connect → Connect your application');
            console.error('\n3. Network/DNS issues');
            console.error('   → Try from a different network');
            console.error('   → Check if firewall is blocking MongoDB ports');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n🔧 FIX:');
            console.error('1. Check username and password in .env.local');
            console.error('2. Verify user exists in Database Access section');
            console.error('3. Reset password if needed');
        } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
            console.error('\n🔧 FIX:');
            console.error('1. Add 0.0.0.0/0 to Network Access in MongoDB Atlas');
            console.error('2. Wait 1-2 minutes for changes to take effect');
        }
        console.error('\n📋 Full Error Details:');
        console.error(error);
        process.exit(1);
    }
};
testConnection();