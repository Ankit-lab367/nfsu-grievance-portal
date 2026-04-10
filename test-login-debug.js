const axios = require('axios');
async function testLogin() {
    try {
        console.log('Testing login with Ankit@gmail.com...');
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'Ankit@gmail.com',
            password: 'password123' 
        });
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error Message:', error.message);
        }
    }
}
testLogin();