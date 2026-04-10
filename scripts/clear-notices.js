const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function clearNotices() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.db.collection('notices').deleteMany({});
    console.log(`Deleted ${result.deletedCount} notices successfully.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearNotices();
