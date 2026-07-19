const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://rockysa141_db_user:Ankit_bos12@ac-wuyao1b-shard-00-00.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-01.p3nvu25.mongodb.net:27017,ac-wuyao1b-shard-00-02.p3nvu25.mongodb.net:27017/nfsu-grievance?ssl=true&authSource=admin&retryWrites=true&w=majority';
const API_URL = 'http://localhost:3000';

function crackOtp(targetHash) {
    const start = Date.now();
    for (let i = 100000; i <= 999999; i++) {
        const otpStr = i.toString();
        const hash = crypto.createHash('sha256').update(otpStr).digest('hex');
        if (hash === targetHash) {
            console.log(`🔑 Cracked OTP hash in ${Date.now() - start}ms! Plaintext: ${otpStr}`);
            return otpStr;
        }
    }
    return null;
}

async function verifyAuthCookies() {
    console.log('🧪 RUNNING COOKIE AUTH & MIDDLEWARE INTEGRATION TEST...');

    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB.');

        // Get standard User model/schema to read fields
        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            role: String,
            isActive: Boolean,
            otpCode: String,
            otpExpires: Date,
            password: { type: String, select: false }
        }), 'users');

        const testEmail = 'target@test.com';
        const testPassword = 'password123';

        // Upsert user
        console.log('\nSetting up test user target@test.com in DB...');
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        
        await User.findOneAndUpdate(
            { email: testEmail },
            {
                name: 'Test Target User',
                email: testEmail,
                password: hashedPassword,
                role: 'student',
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('✅ Test user target@test.com is set up in MongoDB.');

        // Step 1: Login attempt
        console.log('\nStep 1: Making login request to /api/auth/login...');
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: testEmail,
            password: testPassword
        });

        if (!loginResponse.data.otpRequired) {
            throw new Error('Expected otpRequired to be true, but it was not.');
        }
        console.log('✅ Login API responded that OTP is required.');

        // Step 2: Fetch the hashed OTP from database and crack it
        console.log('\nStep 2: Retrieving OTP hash from MongoDB...');
        const updatedUser = await User.findOne({ email: testEmail });
        const hashedOtp = updatedUser.otpCode;
        if (!hashedOtp) {
            throw new Error('No OTP code stored in user document.');
        }
        console.log(`Stored OTP hash: ${hashedOtp}`);

        const plaintextOtp = crackOtp(hashedOtp);
        if (!plaintextOtp) {
            throw new Error('Failed to crack OTP hash.');
        }

        // Step 3: Verify OTP and check for Set-Cookie header
        console.log('\nStep 3: Verifying OTP with /api/auth/verify-otp...');
        const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
            email: testEmail,
            otpCode: plaintextOtp
        }, {
            maxRedirects: 0,
            validateStatus: (status) => status < 500
        });

        console.log('Response status:', verifyResponse.status);
        const setCookieHeaders = verifyResponse.headers['set-cookie'];
        console.log('Set-Cookie Headers:', setCookieHeaders);

        if (!setCookieHeaders || setCookieHeaders.length === 0) {
            throw new Error('Missing Set-Cookie header in OTP verification response!');
        }

        const cookieStr = setCookieHeaders[0];
        if (!cookieStr.includes('auth_token=')) {
            throw new Error('auth_token cookie was not found in Set-Cookie header!');
        }
        if (!cookieStr.includes('HttpOnly')) {
            throw new Error('auth_token cookie is NOT HttpOnly!');
        }
        console.log('✅ auth_token cookie is present and HttpOnly!');

        // Extract cookie value for subsequent requests
        const cookieValue = cookieStr.split(';')[0];
        console.log(`Extracted Cookie: ${cookieValue}`);

        // Step 4: Verify middleware backward compatibility (using dummy token)
        console.log('\nStep 4: Accessing protected endpoint /api/auth/me with auth_token cookie and dummy token...');
        const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
                'Cookie': cookieValue,
                'Authorization': 'Bearer cookie-auth'
            }
        });

        console.log('Profile Response status:', profileResponse.status);
        console.log('Profile Data (Email):', profileResponse.data?.user?.email);
        
        if (profileResponse.status === 200 && profileResponse.data?.user?.email === testEmail) {
            console.log('✅ Access successful! Middleware successfully translated cookie to Authorization header.');
        } else {
            throw new Error('Failed to access protected route with cookie + dummy header.');
        }

        // Step 5: Test logout
        console.log('\nStep 5: Testing logout...');
        const logoutResponse = await axios.post(`${API_URL}/api/auth/logout`, {}, {
            headers: { 'Cookie': cookieValue }
        });

        console.log('Logout Response status:', logoutResponse.status);
        const logoutSetCookie = logoutResponse.headers['set-cookie'];
        console.log('Logout Set-Cookie Headers:', logoutSetCookie);

        if (!logoutSetCookie || logoutSetCookie.length === 0) {
            throw new Error('Missing Set-Cookie header in logout response!');
        }

        const logoutCookieStr = logoutSetCookie[0];
        if (!logoutCookieStr.includes('auth_token=;') && !logoutCookieStr.includes('auth_token=deleted')) {
            // Check if max-age is 0 or expires in past
            if (!logoutCookieStr.includes('Max-Age=0') && !logoutCookieStr.includes('expires=')) {
                throw new Error('auth_token cookie was not cleared in logout response!');
            }
        }
        console.log('✅ auth_token cookie is cleared successfully by logout!');

        console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('   API Response status:', error.response.status);
            console.error('   API Response data:', error.response.data);
        }
    } finally {
        mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

verifyAuthCookies();
