const axios = require('axios');
const API_URL = 'http://localhost:3000';
async function diagnoseLogin() {
    console.log('🔬 COMPREHENSIVE LOGIN DIAGNOSTICS\n');
    console.log('='.repeat(50));
    console.log('\n📡 Test 1: Checking server status...');
    try {
        const homeResponse = await axios.get(API_URL);
        console.log('✅ Server is running');
    } catch (error) {
        console.log('❌  Server is NOT responding');
        console.log(`Error: ${error.message}`);
        return;
    }
    const testUsers = [
        { email: 'test@nfsu.ac.in', password: 'test123' },
        { email: 'testuser6630@nfsu.ac.in', password: 'test123456'},
        { email: 'admin@nfsu.ac.in', password: 'admin123' }
    ];
    for (const user of testUsers) {
        console.log(`\n📝 Test 2: Attempting login with ${user.email}...`);
        try {
            const startTime = Date.now();
            const response = await axios.post(`${API_URL}/api/auth/login`, user);
            const endTime = Date.now();
            if (response.data.success) {
                console.log('✅ LOGIN SUCCESSFUL!');
                console.log(`   Name: ${response.data.user.name}`);
                console.log(`   Role: ${response.data.user.role}`);
                console.log(`   Time: ${endTime - startTime}ms`);
                console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
                console.log(`\n🔑 Test 3: Verifying token with /api/auth/me...`);
                try {
                    const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${response.data.token}`
                        }
                    });
                    console.log('✅ Token verification successful!');
                    console.log(`   User verified: ${meResponse.data.user.name}`);
                } catch (meError) {
                    console.log('❌ Token verification failed');
                    console.log(`   Error: ${meError.response?.data?.error || meError.message}`);
                }
                console.log('\n✨ LOGIN SYSTEM IS WORKING CORRECTLY!');
                return;
            }
        } catch (error) {
            if (error.response) {
                console.log(`❌ Login failed: ${error.response.data.error}`);
                console.log(`   Status: ${error.response.status}`);
            } else if (error.request) {
                console.log('❌ No response from server');
                console.log(`   Error: ${error.message}`);
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    console.log('\n⚠️  Could not login with any test credentials');
    console.log('💡 Possible issues:');
    console.log('   1. Wrong password for existing users');
    console.log('   2. Users need to be created first');
    console.log('   3. API route issue');
    console.log('\n📋 To fix: Register a new user at http://localhost:3000/register');
}
diagnoseLogin();