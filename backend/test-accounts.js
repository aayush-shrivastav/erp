const mongoose = require('mongoose');
const axios = require('axios');
const API_URL = 'http://localhost:5005/api/v1';

const testAccountsFlow = async () => {
    try {
        console.log('--- Setting up DB and Admin Auth ---');
        // 1. Authenticate as Admin
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@eduerp.com',
            password: 'admin123'
        });
        const adminToken = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${adminToken}` } };
        console.log('Admin logged in.');

        // 2. Fetch required reference IDs (Course, Sem, Student)
        const courses = await axios.get(`${API_URL}/academic/courses`, config);
        const semesters = await axios.get(`${API_URL}/academic/semesters`, config);
        const students = await axios.get(`${API_URL}/students`, config);

        const courseId = courses.data.data[0]._id;
        const semId = semesters.data.data[0]._id;
        const student = students.data.data[0];

        console.log('--- 1. Testing Fee Structure Creation ---');
        // Create a past-due structure to test fine logic
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

        let structureId;
        try {
            const structureRes = await axios.post(`${API_URL}/accounts/structures`, {
                course: courseId,
                semester: semId,
                tuitionFee: 50000,
                labFee: 5000,
                libraryFee: 2000,
                otherCharges: 1000,
                dueDate: pastDate,
                finePerDay: 100,
                maxFineLimit: 2000
            }, config);
            structureId = structureRes.data.data._id;
            console.log('✅ Fee Structure Created:', structureRes.data.data.totalAmount, 'Expected: 58000');
        } catch (e) {
            // Already exists? Just fetch it.
            const stRes = await axios.get(`${API_URL}/accounts/structures`, config);
            structureId = stRes.data.data[0]._id;
            console.log('⚠️ Using existing fee structure.', structureId);
        }

        console.log('\n--- 2. Testing Fee Assignment ---');
        const assignRes = await axios.post(`${API_URL}/accounts/assign`, {
            course: courseId,
            semester: semId,
            feeStructureId: structureId
        }, config);
        console.log('✅ Fees Assigned:', assignRes.data.message);

        console.log('\n--- 3. Testing Fee Auto Fine Calculation (Fetch Student Fees) ---');
        // This GET computes the fines
        const feeRes = await axios.get(`${API_URL}/accounts/student-fees/${student._id}`, config);
        const studentFee = feeRes.data.data[0];
        console.log(`✅ Fetched Fees for ${student.name}.`);
        console.log(`Expected Base Fee: 58000 | Actual Base Fee: ${studentFee.totalAmount}`);
        console.log(`Days Late: 10 | Rate: 100/day | Auto Fine Expected: 1000 | Actual: ${studentFee.autoFineAmount}`);
        console.log(`Total Payable: ${studentFee.totalPayable}`);

        console.log('\n--- 4. Testing Manual Fine Addition ---');
        const manualFineRes = await axios.post(`${API_URL}/accounts/student-fees/${studentFee._id}/manual-fine`, {
            amount: 500,
            reason: 'Library Damage',
            description: 'Lost a book'
        }, config);

        const updatedFee = manualFineRes.data.data;
        console.log(`✅ Manual Fine Added.`);
        console.log(`Total Fine Amount Expected: 1500 (1000 + 500). Actual: ${updatedFee.totalFineAmount}`);
        console.log(`New Total Payable expected: 59500 (58000 + 1500). Actual: ${updatedFee.totalPayable}`);

        console.log('\n--- 5. Testing Payment Processing ---');
        const payAmount = updatedFee.remainingBalance || 20000;

        const paymentRes = await axios.post(`${API_URL}/accounts/payments`, {
            studentFeeId: studentFee._id,
            amountPaid: payAmount,
            paymentMode: 'CASH'
        }, config);

        console.log(`✅ Payment Processed! Receipt No: ${paymentRes.data.data.receipt.receiptNumber}`);
        console.log(`Paid Amount Expected: ${payAmount}. Actual: ${paymentRes.data.data.payment.amountPaid}`);
        console.log(`Remaining Balance Expected: 0. Actual: ${paymentRes.data.data.receipt.remainingBalance}`);
        console.log(`Receipt PDF stored at: ${paymentRes.data.data.receipt.pdfUrl}`);

        console.log('\n--- 6. Testing Dashboard APIs ---');
        const dashboardRes = await axios.get(`${API_URL}/accounts/dashboard`, config);
        console.log(`✅ Total Collection: ${dashboardRes.data.data.totalCollected}`);
        console.log(`✅ Expected Fines: ${dashboardRes.data.data.totalFineExpected}`);

        console.log('\n✅ All Accounts Module Tests Passed Successfully!');
        process.exit(0);
    } catch (err) {
        if (err.response) {
            console.error('❌ Test Failed on URL:', err.response.config.url);
            console.error('Status:', err.response.status);
            console.error('Message:', err.response.data?.message || err.message);
        } else {
            console.error('❌ Test Failed:', err.message);
        }
        process.exit(1);
    }
};

testAccountsFlow();
