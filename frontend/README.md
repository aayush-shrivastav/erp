# College ERP - Institutional Management System

## Overview
A high-complexity Enterprise Resource Planning (ERP) system tailored for Indian Higher Education Institutions. This system manages Academic, Finance, and Administrative operations with a focus on data integrity, audit trails, and user experience.

## Key Modules
- **Admin Panel:** Session management, class hierarchies (Class Tree), teacher/student registry, and promotion workflows.
- **Teacher Portal:** Attendance desks with mid-semester normalization, Marks entry with draft recovery and audit trails.
- **Finance Module:** Dual-ledger accounting (Student vs. DRCC/Scholarship), fee receipt generation with automated conversion.
- **Student Dashboard:** Documents management and academic history tracking.

## Technical Architecture
- **Frontend:** React with Vite, Tailwind CSS for institutional branding.
- **State Management:** Context API (Session, Toast, Calendar).
- **Hardening Features:**
  - `isSubmittingRef`: Prevents duplicate form submissions.
  - `useBlocker`: Protects unsaved data during navigation.
  - `Audit Logging`: Every administrative change is logged to the system registry.

## Security & Reliability
- **Session Timeout:** Automatic inactivity tracking (30 min) with a 5-min warning modal.
- **Draft Restore:** Marks and Attendance data is persisted locally to prevent data loss on network failure.
- **Rollback Mechanism:** Promotions can be undone within a 24-hour window for error correction.

## Developer Guide
### Local Setup
1. `npm install`
2. `npm run dev`

### Production Readiness
- All UI components are documented via JSDoc.
- Use `src/constants/index.js` for all configuration tokens.
- Lazy loading is implemented for all major route modules for optimal LCP.

## Support & Handoff
For architectural queries or SaaS expansion (multi-tenancy), refer to the `src/constants/index.js` for branding tokens and `SessionContext.jsx` for activity tracking logic.
