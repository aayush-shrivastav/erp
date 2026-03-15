const http = require('http');

const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
};

async function runTests() {
    try {
        console.log("1. Testing Login...");
        const loginData = JSON.stringify({ email: 'test1@test.com', password: 'password123' });
        const loginOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        };
        const loginResult = await makeRequest(loginOptions, loginData);
        const token = loginResult.token;
        console.log("Login Successful! Token received.");

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`
        };

        console.log("\n2. Testing /students/me...");
        const meOptions = { hostname: 'localhost', port: 5000, path: '/api/v1/students/me', method: 'GET', headers: defaultHeaders };
        const meResult = await makeRequest(meOptions);
        console.log("Profile Data fetched:", meResult.data?.name, "|", meResult.data?.email);
        const sectionId = meResult.data?.section?._id;

        console.log("\n3. Testing /attendance/my-attendance...");
        const attendanceOptions = { hostname: 'localhost', port: 5000, path: '/api/v1/attendance/my-attendance', method: 'GET', headers: defaultHeaders };
        const attendanceResult = await makeRequest(attendanceOptions);
        console.log(`Attendance Records count: ${attendanceResult.count}`);

        console.log("\n4. Testing /fees/my-fees...");
        const feesOptions = { hostname: 'localhost', port: 5000, path: '/api/v1/fees/my-fees', method: 'GET', headers: defaultHeaders };
        const feesResult = await makeRequest(feesOptions);
        console.log(`Fees Records count: ${feesResult.count}`);

        console.log("\n5. Testing /marks/my-marks...");
        const marksOptions = { hostname: 'localhost', port: 5000, path: '/api/v1/marks/my-marks', method: 'GET', headers: defaultHeaders };
        const marksResult = await makeRequest(marksOptions);
        console.log(`Marks Records count: ${marksResult.count}`);

        console.log("\n6. Testing /notices...");
        const noticesOptions = { hostname: 'localhost', port: 5000, path: '/api/v1/notices', method: 'GET', headers: defaultHeaders };
        const noticesResult = await makeRequest(noticesOptions);
        console.log(`Total Notices count: ${noticesResult.count}`);

        if (sectionId) {
            console.log(`\n7. Testing /timetables/section/${sectionId}...`);
            const timetableOptions = { hostname: 'localhost', port: 5000, path: `/api/v1/timetables/section/${sectionId}`, method: 'GET', headers: defaultHeaders };
            const timetableResult = await makeRequest(timetableOptions);
            console.log(`Timetable slots count: ${timetableResult.data?.length || 0}`);
        }

        console.log("\n✅ All Student APIs executed successfully!");

    } catch (err) {
        console.error("Test Failed:", err.message);
    }
}

runTests();
