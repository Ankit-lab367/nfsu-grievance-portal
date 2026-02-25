// Test script to verify login API
const testLogin = async () => {
    const testEmail = "test@nfsu.ac.in";
    const testPassword = "test123";

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
            console.log('Token:', data.token);
            console.log('User:', data.user);
        } else {
            console.log('\n❌ LOGIN FAILED:', data.error);
        }
    } catch (error) {
        console.error('Error during login test:', error);
    }
};

testLogin();
