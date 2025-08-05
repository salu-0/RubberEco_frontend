// Test API routes
const http = require('http');

function testRoute(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API routes...\n');

  // Test 1: Direct test route
  try {
    console.log('1️⃣ Testing /api/training/direct-test');
    const result1 = await testRoute('/api/training/direct-test');
    console.log(`   Status: ${result1.statusCode}`);
    console.log(`   Response: ${result1.data}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Direct demo enrollment
  try {
    console.log('2️⃣ Testing /api/training/direct-demo-enroll');
    const enrollmentData = {
      userId: '688cddaa5587f9435c6739b1',
      moduleId: 3,
      moduleTitle: 'Test Module',
      moduleLevel: 'Beginner',
      paymentAmount: 5000,
      paymentMethod: 'stripe',
      paymentId: `API_TEST_${Date.now()}`,
      userDetails: {
        name: 'API Test User',
        email: 'apitest@example.com',
        phone: '9876543210',
        experience: 'beginner',
        motivation: 'Testing API enrollment'
      }
    };

    const result2 = await testRoute('/api/training/direct-demo-enroll', 'POST', enrollmentData);
    console.log(`   Status: ${result2.statusCode}`);
    console.log(`   Response: ${result2.data}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Get user enrollments
  try {
    console.log('3️⃣ Testing /api/training/direct-user/688cddaa5587f9435c6739b1');
    const result3 = await testRoute('/api/training/direct-user/688cddaa5587f9435c6739b1');
    console.log(`   Status: ${result3.statusCode}`);
    console.log(`   Response: ${result3.data}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('✅ API testing complete!');
}

testAPI();
