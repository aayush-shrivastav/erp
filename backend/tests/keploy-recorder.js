const http = require('http');
const { spawn } = require('child_process');

console.log('--- Keploy Recording Helper ---');

// Start the backend
const backend = spawn('node', ['src/index.js'], {
    env: { ...process.env, PORT: 5005 }, // Use a different port to avoid conflicts
    stdio: 'inherit'
});

setTimeout(async () => {
    console.log('Sending test request to captured API...');
    try {
        // Hit the base route to record a test case
        const res = await new Promise((resolve, reject) => {
            http.get('http://localhost:5005/', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
        console.log('Response received:', res.substring(0, 50) + '...');
    } catch (err) {
        console.error('Error hitting API:', err.message);
    }

    console.log('Closing backend...');
    backend.kill();
    process.exit(0);
}, 10000); // Wait 10 seconds for startup and recording
