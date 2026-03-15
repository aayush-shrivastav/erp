require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const mongoose = require('mongoose');
const http = require('http');

async function testApi() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'faculty@test.com' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/faculty/my-assignments',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };

    const req = http.request(options, res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', data));
    });

    req.on('error', error => console.error(error));
    req.end();
}
testApi().then(() => mongoose.disconnect());
