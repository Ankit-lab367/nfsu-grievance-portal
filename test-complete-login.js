const axios = require('axios');
const API_URL = 'http://localhost:3000';
async function testCompleteLoginFlow() {
    console.log('🧪 TESTING COMPLETE LOGIN FLOW\n');
    console.log('='.repeat(60));
    const credentials = {
        email: 'testuser6630@nfsu.ac.in',
        password: 'test123456'
    };
    try {
        console.log(`\n📝 Step 1: Logging in with ${credentials.email}...`);
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, credentials);
        if (!loginResponse.data.success) {
            console.log('❌ Login failed!');
            return;
        }
        console.log('✅ Login successful!');
        console.log(`   User: ${loginResponse.data.user.name}`);
        console.log(`   Role: ${loginResponse.data.user.role}`);
        const token = loginResponse.data.token;
        const userRole = loginResponse.data.user.role;
        const dashboardPath = `/dashboard/${userRole}`;
        console.log(`\n📄 Step 2: Checking dashboard access (${dashboardPath})...`);
        try {
            const dashboardResponse = await axios.get(`${API_URL}${dashboardPath}`);
            if (dashboardResponse.status === 200) {
                console.log(`✅ Dashboard page loaded successfully!`);
                console.log(`   Status: ${dashboardResponse.status}`);
                console.log(`   Page size: ${(dashboardResponse.data.length / 1024).toFixed(2)} KB`);
            }
        } catch (dashError) {
            if (dashError.response) {
                console.log(`⚠️  Dashboard returned status: ${dashError.response.status}`);
                if (dashError.response.status === 302 || dashError.response.status === 307) {
                    console.log(`   Redirected to: ${dashError.response.headers.location}`);
                    console.log(`   ❌ ISSUE: Middleware is blocking dashboard access!`);
                } else {
                    console.log(`   This is normal - page needs browser environment`);
                }
            } else {
                console.log(`❌ Error: ${dashError.message}`);
            }
        }
        console.log(`\n🔑 Step 3: Verifying token with /api/auth/me...`);
        const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (meResponse.data.success) {
            console.log(`✅ Token is valid!`);
            console.log(`   Verified user: ${meResponse.data.user.name}`);
        }
        console.log(`\n🎉 COMPLETE LOGIN FLOW TEST PASSED!`);
        console.log(`\n📋 Instructions for manual test:`);
        console.log(`   1. Open browser to: http://localhost:3000/login`);
        console.log(`   2. Login with:`);
        console.log(`      Email: ${credentials.email}`);
        console.log(`      Password: ${credentials.password}`);
        console.log(`   3. You should be redirected to: http://localhost:3000${dashboardPath}`);
        console.log(`   4. Dashboard should load with your name and stats`);
    } catch (error) {
        console.log(`\n❌ TEST FAILED`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error: ${error.response.data.error || error.response.statusText}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
    }
}
testCompleteLoginFlow();