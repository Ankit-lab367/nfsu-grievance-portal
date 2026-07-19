const http = require('http');

console.log('Testing connection to local development server...');

const req = http.request({
    host: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
}, (res) => {
    console.log('Server responded! Status:', res.statusCode);
    console.log('Response Headers:');
    console.log(JSON.stringify(res.headers, null, 2));

    const expectedHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'referrer-policy',
        'permissions-policy'
    ];

    console.log('\n--- Checking Security Headers ---');
    expectedHeaders.forEach(header => {
        if (res.headers[header]) {
            console.log(`✅ ${header}: ${res.headers[header]}`);
        } else {
            console.log(`❌ ${header} is missing!`);
        }
    });

    process.exit(0);
});

req.on('error', (err) => {
    console.error('❌ Failed to connect to server:', err.message);
    console.error('Make sure "npm run dev" is actively running on port 3000.');
    process.exit(1);
});

req.end();
