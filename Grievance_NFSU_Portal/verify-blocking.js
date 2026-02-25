const axios = require('axios');

async function verifyBlocking() {
    const baseUrl = 'http://localhost:3000';
    const godToken = 'everythingdarkhere';
    const targetEmail = 'target@test.com';
    const targetPassword = 'password123';

    try {
        console.log('1. Fetching users to find target ID...');
        const usersRes = await axios.get(`${baseUrl}/api/admin/users`, {
            headers: { Authorization: `Bearer ${godToken}` }
        });

        const target = usersRes.data.users.find(u => u.email === targetEmail);
        if (!target) throw new Error('Target user not found in database');
        console.log(`Target ID: ${target._id}`);

        console.log('\n2. Blocking target user...');
        await axios.patch(`${baseUrl}/api/admin/users`, {
            userId: target._id,
            isActive: false
        }, {
            headers: { Authorization: `Bearer ${godToken}` }
        });
        console.log('User blocked.');

        console.log('\n3. Attempting login as blocked user...');
        try {
            await axios.post(`${baseUrl}/api/auth/login`, {
                email: targetEmail,
                password: targetPassword
            });
            console.log('Error: Login should have failed!');
        } catch (error) {
            console.log('Login failed as expected.');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.error);

            if (error.response.data.error === 'Your account has been blocked. Access revoked by God Mode.') {
                console.log('\n✅ VERIFICATION SUCCESSFUL: CORRECT ERROR MESSAGE RECEIVED.');
            } else {
                console.log('\n❌ VERIFICATION FAILED: INCORRECT ERROR MESSAGE.');
            }
        }

        console.log('\n4. Restoring access (Unblocking)...');
        await axios.patch(`${baseUrl}/api/admin/users`, {
            userId: target._id,
            isActive: true
        }, {
            headers: { Authorization: `Bearer ${godToken}` }
        });
        console.log('User unblocked.');

        console.log('\n5. Attempting login after restoration...');
        const loginRes = await axios.post(`${baseUrl}/api/auth/login`, {
            email: targetEmail,
            password: targetPassword
        });
        if (loginRes.data.success) {
            console.log('Login successful after restoration.');
            console.log('✅ VERIFICATION SUCCESSFUL: RESTORATION WORKS.');
        }

    } catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
    }
}

verifyBlocking();
