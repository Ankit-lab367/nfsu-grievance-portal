const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority';
async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            isActive: Boolean
        }), 'users');
        const users = await User.find({}, 'email role isActive');
        console.log('USERS:', JSON.stringify(users, null, 2));
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
listUsers();