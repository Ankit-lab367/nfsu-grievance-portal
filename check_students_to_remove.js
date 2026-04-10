const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority";
async function checkStudents() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            name: String
        }));
        const studentsToRemove = await User.find({
            role: 'student',
            email: { $not: /@tr\.nfsu\.edu\.in$/i }
        });
        console.log(`Found ${studentsToRemove.length} students to remove:`);
        studentsToRemove.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [ID: ${u._id}]`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}
checkStudents();