// Performance Test - Registration
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testRegistration() {
    console.log('🧪 Testing Registration Performance...\n');

    // Generate random user to avoid conflicts
    const randomNum = Math.floor(Math.random() * 10000);
    const testUser = {
        name: `Test User ${randomNum}`,
        email: `testuser${randomNum}@nfsu.ac.in`,
        password: 'test123456',
        enrollmentNumber: `NFSU${randomNum}`,
        course: 'Computer Science',
        year: 2,
        phone: '1234567890',
        role: 'student'
    };

    try {
        console.log(`📝 Registering user: ${testUser.email}`);

        const startTime = Date.now();
        const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        if (response.data.success) {
            console.log('✅ Registration Successful!');
            console.log(`⏱️  Total Time: ${totalTime}ms`);
            console.log(`👤 User: ${response.data.user.name}`);
            console.log(`🔑 Role: ${response.data.user.role}`);
            console.log(`📧 Email: ${response.data.user.email}\n`);

            if (totalTime < 500) {
                console.log('🚀 EXCELLENT! Registration is very fast (< 500ms)');
            } else if (totalTime < 1000) {
                console.log('✨ GOOD! Registration is reasonably fast (< 1000ms)');
            } else {
                console.log('⚠️  Registration is still slow (> 1000ms) - may need more optimization');
            }
        }
    } catch (error) {
        console.log('❌ Registration Failed!');
        if (error.response) {
            console.log(`Error: ${error.response.data.error}`);
        } else {
            console.log(`Error: ${error.message}`);
            console.log('\n💡 Make sure the server is running: npm run dev');
        }
    }
}

testRegistration();
