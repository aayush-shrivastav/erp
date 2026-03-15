require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Faculty = require('./src/models/Faculty');
const Subject = require('./src/models/Subject');
const Section = require('./src/models/Section');
const SubjectAssignment = require('./src/models/SubjectAssignment');
const Department = require('./src/models/Department');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_erp';

async function seedFaculty() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Check if faculty exists, delete to recreate fresh
        const existingUser = await User.findOne({ email: 'faculty@test.com' });
        if (existingUser) {
            await Faculty.deleteMany({ user: existingUser._id });
            await SubjectAssignment.deleteMany({ faculty: existingUser._id });
            await User.findByIdAndDelete(existingUser._id);
            console.log('Deleted existing test faculty');
        }

        // Create User
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            email: 'faculty@test.com',
            password: hashedPassword,
            role: 'FACULTY',
            isActive: true
        });

        // Get or Create Department
        let dept = await Department.findOne();
        if (!dept) {
            dept = await Department.create({ name: 'Computer Science', code: 'CSE' });
        }

        // Create Faculty Profile
        const faculty = await Faculty.create({
            user: user._id,
            employeeId: 'EMP1001',
            name: 'Dr. John Doe',
            title: 'Professor',
            department: dept._id,
            gender: 'Male',
            contactNumber: '9999999999',
            designation: 'Professor' // added requirement mapping
        });

        console.log('Created Faculty:', faculty.name);

        // Assign some subjects and classes
        const subjects = await Subject.find().limit(2);
        const sections = await Section.find().limit(2);

        if (subjects.length > 0 && sections.length > 0) {
            for (let i = 0; i < Math.min(subjects.length, sections.length); i++) {
                await SubjectAssignment.create({
                    faculty: faculty._id,
                    subject: subjects[i]._id,
                    section: sections[i]._id
                });

                // Add subject to faculty profile array (as that's how some queries might work)
                await Faculty.findByIdAndUpdate(faculty._id, {
                    $addToSet: { subjects: subjects[i]._id }
                });
                console.log(`Assigned Subject ${subjects[i].code} to class ${sections[i].name}`);
            }
        } else {
            console.log('No subjects or sections found to assign');
        }

        console.log('Done Seeding Faculty');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedFaculty();
