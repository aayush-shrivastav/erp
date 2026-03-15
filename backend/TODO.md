# Accounts Module Implementation Plan

## Task: Create backend module for Accounts/Finance section

## Information Gathered:
- Existing User model has roles: SUPER_ADMIN, ADMIN, ACADEMIC_ADMIN, ACCOUNTS_ADMIN, ACCOUNTANT, FACULTY, STUDENT
- Student model has: enrollmentNo, universityRollNo, name, department, course, fundingType (SELF, DRCC, SCHOLARSHIP)
- Existing Payment model for storing payments
- Existing StudentFee model for tracking fee balances per fee structure
- Existing FeeStructure model for course/semester wise fees
- Auth middleware supports protect and authorize functions

## Plan:

### 1. Create Models (backend/src/models/)
- [x] Transaction.js - Common transaction model for all fee types
- [x] EditHistory.js - Track all payment edits
- [x] StudentLedger.js - Track student financial summary

### 2. Create Controllers (backend/src/controllers/)
- [x] accountsTransactionController.js - Main controller with all APIs
  - verifyStudent - GET /api/accounts/student/:rollNo
  - addCollegeFee - POST /api/accounts/college-fee
  - addBusFee - POST /api/accounts/bus-fee
  - addFine - POST /api/accounts/fine
  - editPayment - PUT /api/accounts/edit-payment/:id
  - getTransactions - GET /api/accounts/transactions/:rollNo

### 3. Update Routes (backend/src/routes/)
- [x] accountRoutes.js - Add new routes with proper middleware

### 4. Testing
- [x] All modules loaded successfully
- [x] Server connected to MongoDB successfully

## Dependent Files to be edited:
- backend/src/routes/accountRoutes.js
- backend/src/models/User.js

## Followup steps:
- Install any required dependencies (already installed - uuid)
- Test the APIs using Postman or similar tool
- Ensure all error handling is working correctly

## API Endpoints implemented:
1. GET /api/accounts/student/:rollNo - Verify and fetch student details
2. POST /api/accounts/college-fee - Add college fee payment
3. POST /api/accounts/bus-fee - Add bus fee payment
4. POST /api/accounts/fine - Add fine
5. PUT /api/accounts/edit-payment/:id - Edit payment with history
6. GET /api/accounts/transactions/:rollNo - Get transaction history
7. GET /api/accounts/edit-history/:rollNo - Get edit history

