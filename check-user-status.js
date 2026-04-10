const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority';
async function checkUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            isActive: Boolean,
            name: String,
            role: String
        }), 'users');
        const user = await User.findOne({ email: 'ankit@gmail.com' });
        if (user) {
            console.log('USER_EMAIL:', user.email);
            console.log('USER_ACTIVE:', user.isActive);
            console.log('USER_ROLE:', user.role);
            console.log('USER_NAME:', user.name);
        } else {
            console.log('USER_NOT_FOUND');
        }
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
checkUser();