require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./src/models/User');
const Faculty = require('./src/models/Faculty');
const SubjectAssignment = require('./src/models/SubjectAssignment');
require('./src/models/Subject');
require('./src/models/Section');
require('./src/models/Semester');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const user = await User.findOne({ email: 'faculty@test.com' });
    const faculty = await Faculty.findOne({ user: user._id });
    const assignments = await SubjectAssignment.find({ faculty: faculty._id })
        .populate('subject')
        .populate({
            path: 'section',
            populate: { path: 'semester' }
        });
    fs.writeFileSync('assignments.json', JSON.stringify(assignments, null, 2), 'utf8');
    process.exit(0);
});
