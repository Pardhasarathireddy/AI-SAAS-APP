import fetch from 'node-fetch';

async function testLogin() {
    const registerUrl = 'http://localhost:5000/api/auth/register';
    const loginUrl = 'http://localhost:5000/api/auth/login';

    const timestamp = Date.now();
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test.user${timestamp}@example.com`,
        password: 'Password123!',
    };

    console.log('--- Phase 1: Registration ---');
    try {
        const regResp = await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        });

        const regData = await regResp.json();
        console.log('Reg Status:', regResp.status);

        if (regResp.status !== 201) {
            console.error('Registration failed:', regData);
            return;
        }
        console.log('User registered successfully.');

        console.log('\n--- Phase 2: Login ---');
        const loginResp = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
            }),
        });

        const loginData = await loginResp.json();
        console.log('Login Status:', loginResp.status);
        console.log('Login Response:', JSON.stringify(loginData, null, 2));

        if (loginResp.status === 200 && loginData.token) {
            console.log('\nTest PASSED: Login successful and JWT received.');
        } else {
            console.log('\nTest FAILED: Login failed.');
        }

    } catch (error) {
        console.error('Test FAILED with error:', error.message);
    }
}

testLogin();
