const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority";
async function cleanupStudents() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            name: String
        }));
        const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', new mongoose.Schema({
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }));
        const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({
            recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }));
        const studentsToRemove = await User.find({
            role: 'student',
            email: { $not: /@tr\.nfsu\.edu\.in$/i }
        });
        if (studentsToRemove.length === 0) {
            console.log('No students found to remove.');
            await mongoose.disconnect();
            return;
        }
        console.log(`Preparing to remove ${studentsToRemove.length} students and their associated data...`);
        const studentIds = studentsToRemove.map(u => u._id);
        const complaintResult = await Complaint.deleteMany({ studentId: { $in: studentIds } });
        console.log(`Deleted ${complaintResult.deletedCount} associated complaints.`);
        const notificationResult = await Notification.deleteMany({ recipientId: { $in: studentIds } });
        console.log(`Deleted ${notificationResult.deletedCount} associated notifications.`);
        const userResult = await User.deleteMany({ _id: { $in: studentIds } });
        console.log(`Deleted ${userResult.deletedCount} student accounts.`);
        console.log('Cleanup complete.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}
cleanupStudents();