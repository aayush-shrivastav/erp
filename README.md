# College ERP System

A comprehensive full-stack College Enterprise Resource Planning (ERP) system built with modern web technologies. This project provides a complete solution for managing academic and administrative processes in educational institutions.

## 📋 Project Description

College ERP is a web-based application designed to streamline and automate various academic and administrative tasks in educational institutions. It offers role-based access for different stakeholders including administrators, faculty members, students, and accountants, each with dedicated portals tailored to their specific needs.

The system handles critical operations such as student management, attendance tracking, grade submission, fee management, and institutional notices - all through an intuitive, modern user interface.

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React | UI Framework |
| Vite | Build Tool |
| React Router | Client-side Routing |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| PostgreSQL | Relational Database |
| Prisma | ORM |
| JWT | Authentication |
| bcryptjs | Password Hashing |

### Testing
| Technology | Purpose |
|------------|---------|
| Jest | API Testing |
| Supertest | HTTP Assertions |
| Playwright | E2E Testing |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Admin  │ │ Faculty │ │ Student │ │Accountant│           │
│  │ Portal  │ │ Portal  │ │ Portal  │ │  Portal  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
└───────┼───────────┼───────────┼───────────┼─────────────────┘
        │           │           │           │
        └───────────┴─────┬─────┴───────────┘
                          │
                    ┌─────▼─────┐
                    │  REST API │
                    │ (Express) │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  Prisma   │
                    │   ORM     │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL │
                    │  Database  │
                    └───────────┘
```

---

## ✨ Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Faculty, Student, Accountant)
- Protected routes with automatic redirect
- Session management

### Admin Portal
- 📊 Dashboard with analytics and statistics
- 👥 Student management (Add, Edit, Delete, Search)
- 👨‍🏫 Faculty management
- 🏛️ Department and Course management
- 📚 Subject management
- 📅 Academic sessions
- 💰 Fees management and Fee structures
- 📝 Attendance overview
- 📢 Notice creation and distribution

### Faculty Portal
- 📊 Personal dashboard
- 📚 Class management
- ✅ Mark attendance for assigned classes
- 📝 Submit student marks/exams
- 📅 View timetable
- 📢 View notices

### Student Portal
- 📊 Personal dashboard
- 👤 View profile and details
- 📊 View attendance records
- 📝 View marks and grades
- 💰 View fee status and payment history
- 📅 View class timetable
- 📢 View notices

### Accountant Portal
- 📊 Financial dashboard
- 💵 Fee structure management
- 💳 Record payments
- 📋 Payment entry with student search
- 📊 Financial reports
- ⚠️ View defaulters list

---

## 📁 Project Folder Structure

```
college-erp/
├── backend/                      # Express.js API server
│   ├── prisma/                   # Database schema and migrations
│   │   ├── schema.prisma         # Prisma schema
│   │   ├── seed.js               # Database seed script
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js         # Prisma client configuration
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── facultyController.js
│   │   │   ├── feeController.js
│   │   │   └── ...
│   │   ├── middlewares/          # Express middleware
│   │   │   ├── auth.js           # JWT authentication
│   │   │   └── error.js          # Error handling
│   │   ├── models/               # Data models
│   │   ├── routes/               # API routes
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js               # Express app
│   │   ├── index.js             # Entry point
│   │   └── server.js            # Server startup
│   ├── tests/                   # Jest API tests
│   ├── package.json
│   └── .env                     # Environment variables
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── layouts/             # Role-based layouts
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   ├── faculty/         # Faculty pages
│   │   │   ├── student/          # Student pages
│   │   │   ├── accountant/      # Accountant pages
│   │   │   └── Login.jsx        # Authentication
│   │   ├── services/            # API services
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── tests/                   # Playwright E2E tests
│   │   ├── auth/                # Authentication tests
│   │   ├── admin/               # Admin portal tests
│   │   ├── faculty/            # Faculty portal tests
│   │   ├── student/             # Student portal tests
│   │   └── accountant/          # Accountant portal tests
│   ├── playwright/              # Playwright configuration
│   │   ├── setup.js             # Test setup
│   │   └── .auth/               # Auth state storage
│   ├── playwright.config.js
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml           # Docker services
├── package.json                 # Root package.json
└── README.md                    # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18.x or higher |
| PostgreSQL | 14.x or higher |
| npm | 9.x or higher |

### 1. Clone the Repository

```bash
git clone <repository-url>
cd college-erp
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/college_erp?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=5001
NODE_ENV=development
```

### 4. Database Setup

```bash
cd backend

# Run database migrations
npm run migrate

# (Optional) Seed test data
npm run seed
```

### 5. Default Test Accounts

The seed script creates the following test users for initial access:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Super Admin** | admin@eduerp.com | admin123 | Full system access |
| **Admin** | admin2@test.com | pass123 | Admin dashboard access |
| **Academic Admin** | academic@test.com | pass123 | Academic management |
| **Accounts Admin** | accountant@test.com | pass123 | Fee management |
| **Faculty** | teacher@test.com | pass123 | Classes & marks |
| **Student** | student@test.com | pass123 | Student portal |

> **Note:** Run `npm run seed` in the backend folder to create these test users in the database.

### 6. Running the Application

**Start Backend Server:**
```bash
cd backend
npm run dev
```
- Backend runs on: http://localhost:5001

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```
- Frontend runs on: http://localhost:5174

---

## 🧪 Running Tests

### API Tests (Jest + Supertest)

```bash
cd backend
npm test
```

Sample test output:
```
PASS  tests/api.test.js
PASS  tests/student.test.js

Test Suites:  2 passed, 2 total
Tests:        10 passed, 10 total
```

### Playwright E2E Tests

```bash
# Run all tests
cd frontend
npx playwright test

# Run specific project
npx playwright test --project=chromium   # Auth tests
npx playwright test --project=admin      # Admin tests
npx playwright test --project=student    # Student tests
npx playwright test --project=faculty     # Faculty tests
npx playwright test --project=accountant # Accountant tests
```

**Test Configuration:**
| Project | Test File | Storage State |
|---------|-----------|---------------|
| chromium | tests/auth/* | - |
| admin | tests/admin/* | playwright/.auth/admin.json |
| student | tests/student/* | playwright/.auth/student.json |
| faculty | tests/faculty/* | playwright/.auth/faculty.json |
| accountant | tests/accountant/* | playwright/.auth/accountant.json |

---

## 📸 Screenshots

> Add your application screenshots here

### Login Page
![Login Page](./screenshots/login.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)

### Student Dashboard
![Student Dashboard](./screenshots/student-dashboard.png)

### Faculty Dashboard
![Faculty Dashboard](./screenshots/faculty-dashboard.png)

---

## 🔜 Future Improvements

- [ ] SMS/Email notifications for parents
- [ ] Online fee payment gateway integration
- [ ] Library management module
- [ ] Hostel management
- [ ] Transport/Bus tracking
- [ ] Online examination system
- [ ] Result publication system
- [ ] Parent portal for monitoring student progress
- [ ] Mobile application (React Native)
- [ ] Real-time chat support
- [ ] Document management system
- [ ] Alumni tracking

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [your-github-username]
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- College administration for the opportunity
- Open source community for the amazing tools
- Various tutorials and documentation that helped in building this project

---

<p align="center">
  Made with ❤️ for education
</p>

