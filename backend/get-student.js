const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/college-erp').then(async () => {
    const User = require('d:/kkkk/backend/src/models/User');
    const student = await User.findOne({ role: 'STUDENT' });
    console.log('STUDENT_EMAIL:', student ? student.email : 'Not Found');
    const profile = require('d:/kkkk/backend/src/models/Student');
    const p = await profile.findOne({ user: student._id });
    console.log('STUDENT_NAME:', p ? p.name : 'Unknown');
    process.exit(0);
}).catch(console.error);
