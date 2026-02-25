// Performance Test - Login
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('🧪 Testing Login Performance...\n');

    // Test credentials - update with actual user if needed
    const testUser = {
        email: 'test@nfsu.ac.in',
        password: 'test123'
    };

    try {
        const startTime = Date.now();
        const response = await axios.post(`${API_URL}/api/auth/login`, testUser);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        if (response.data.success) {
            console.log('✅ Login Successful!');
            console.log(`⏱️  Total Time: ${totalTime}ms`);
            console.log(`👤 User: ${response.data.user.name}`);
            console.log(`🔑 Role: ${response.data.user.role}`);
            console.log(`📧 Email: ${response.data.user.email}\n`);

            if (totalTime < 400) {
                console.log('🚀 EXCELLENT! Login is very fast (< 400ms)');
            } else if (totalTime < 800) {
                console.log('✨ GOOD! Login is reasonably fast (< 800ms)');
            } else {
                console.log('⚠️  Login is still slow (> 800ms) - may need more optimization');
            }
        }
    } catch (error) {
        console.log('❌ Login Failed!');
        if (error.response) {
            console.log(`Error: ${error.response.data.error}`);
            console.log('\n💡 Tip: Make sure you have a test user registered with:');
            console.log('   Email: test@nfsu.ac.in');
            console.log('   Password: test123');
            console.log('\n   Or update the credentials in test-login.js');
        } else {
            console.log(`Error: ${error.message}`);
            console.log('\n💡 Make sure the server is running: npm run dev');
        }
    }
}

testLogin();
