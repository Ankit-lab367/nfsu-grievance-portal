import axios from 'axios';

const SSO_SHARED_SECRET = 'forensync_grievance_key_8046_sofsy1_zawTub_cinsx_38145'; // From .env.local

async function testSSO() {
    console.log('Testing ForenSync endpoint...');
    const start = Date.now();
    try {
        // We'll send an invalid code just to see if the server responds
        const response = await axios.post('https://forensync-backend.onrender.com/api/sso/verify-code', 
            { code: 'invalid_test_code' }, 
            { 
                headers: { 
                    'x-sso-secret': SSO_SHARED_SECRET,
                    'Content-Type': 'application/json'
                },
                timeout: 60000 // 60s timeout for cold start
            }
        );
        console.log('Response:', response.data);
    } catch (error) {
        const duration = Date.now() - start;
        console.log(`Failed after ${duration}ms`);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error Message:', error.message);
        }
    }
}

testSSO();
