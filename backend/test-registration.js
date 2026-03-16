import fetch from 'node-fetch';

async function testRegistration() {
  const url = 'http://localhost:5000/api/auth/register';
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe' + Date.now() + '@example.com',
    password: 'Password123!',
  };

  console.log('Testing User Registration...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (response.status === 201) {
      console.log('Test PASSED: User registered successfully.');
    } else {
      console.log('Test FAILED: Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('Test FAILED: Error:', error.message);
    // If it's a parsing error, try to get the text
    if (error.message.includes('unexpected token')) {
       // Re-fetch or handle text
       console.log('The response was not JSON. It might be HTML.');
    }
  }
}

testRegistration();
