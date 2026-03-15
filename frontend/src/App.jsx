import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SessionProvider } from './context/SessionContext';
import { CalendarProvider } from './context/CalendarContext';
import RootLayout from './components/layout/RootLayout';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';

import { ShieldX, Clock, AlertTriangle } from 'lucide-react';
import Button from './components/ui/Button';
import Modal from './components/ui/Modal';
import { useSession } from './context/SessionContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Admin Pages (Lazy Loaded)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const SessionsPage = React.lazy(() => import('./pages/admin/SessionsPage'));
const StudentsPage = React.lazy(() => import('./pages/admin/StudentsPage'));
const TeachersPage = React.lazy(() => import('./pages/admin/TeachersPage'));
const ClassTreePage = React.lazy(() => import('./pages/admin/ClassTreePage'));
const SubjectAssignmentPage = React.lazy(() => import('./pages/admin/SubjectAssignmentPage'));
const PromotionPage = React.lazy(() => import('./pages/admin/PromotionPage'));
const ExaminationPage = React.lazy(() => import('./pages/admin/ExaminationPage'));
const ReportsPage = React.lazy(() => import('./pages/admin/ReportsPage'));
const OnboardingWizard = React.lazy(() => import('./pages/admin/OnboardingWizard'));
const DepartmentsPage = React.lazy(() => import('./pages/Departments'));
const CoursesPage = React.lazy(() => import('./pages/Courses'));
const SubjectsPage = React.lazy(() => import('./pages/Subjects'));
const AdminNoticesPage = React.lazy(() => import('./pages/Notices'));
const AdminSettingsPage = React.lazy(() => import('./pages/Settings'));

// Teacher Pages (Lazy Loaded)
const TeacherDashboard = React.lazy(() => import('./pages/teacher/TeacherDashboard'));
const AttendancePage = React.lazy(() => import('./pages/teacher/AttendancePage'));
const MarksEntryPage = React.lazy(() => import('./pages/teacher/MarksEntryPage'));
const MentorDashboard = React.lazy(() => import('./pages/teacher/MentorDashboard'));

// Account Pages (Lazy Loaded)
const AccountsDashboard = React.lazy(() => import('./pages/accounts/AccountsDashboard'));
const FeeManagementPage = React.lazy(() => import('./pages/accounts/FeeManagementPage'));
const StudentLedgerPage = React.lazy(() => import('./pages/accounts/StudentLedgerPage'));

// Student Pages (Lazy Loaded)
const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = React.lazy(() => import('./pages/student/StudentProfile'));
const StudentFees = React.lazy(() => import('./pages/student/StudentFees'));
const StudentMarks = React.lazy(() => import('./pages/student/StudentMarks'));
const StudentAttendance = React.lazy(() => import('./pages/student/StudentAttendance'));
const StudentNotices = React.lazy(() => import('./pages/student/StudentNotices'));
const StudentTimetable = React.lazy(() => import('./pages/student/StudentTimetable'));
const BacklogsPage = React.lazy(() => import('./pages/student/BacklogsPage'));
const DocumentsPage = React.lazy(() => import('./pages/student/DocumentsPage'));

const NotFoundPage = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
    <ShieldX size={64} className="text-slate-300 mb-6" />
    <h1 className="text-3xl font-black text-slate-900 mb-2">404 - Lost in Orbit</h1>
    <p className="text-slate-500 mb-8 max-w-sm mx-auto">The resource you are looking for has been moved or does not exist in the university registry.</p>
    <Button onClick={() => window.location.href = '/'} className="rounded-2xl h-12 px-8">Return to Dashboard</Button>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Maps backend uppercase enum roles to frontend dashboard paths
  const dashboardMap = {
    SUPER_ADMIN: '/admin/dashboard',
    ADMIN: '/admin/dashboard',
    ACADEMIC_ADMIN: '/admin/dashboard',
    ACCOUNTS_ADMIN: '/accountant/dashboard',
    ACCOUNTANT: '/accountant/dashboard',
    FACULTY: '/faculty/dashboard',
    STUDENT: '/student/dashboard',
    // Legacy lowercase aliases kept for backward compatibility
    admin: '/admin/dashboard',
    teacher: '/faculty/dashboard',
    mentor: '/faculty/dashboard',
    accountant: '/accountant/dashboard',
    student: '/student/dashboard',
  };

  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
};

// SessionManager MUST be defined before App so it is available when App renders
const SessionManager = ({ children }) => {
  const { lastActivity, isTimingOut, setIsTimingOut, extendSession } = useSession();
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const WARNING_MS = 25 * 60 * 1000; // Warning at 25 minutes
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds for countdown

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;

      if (elapsed > TIMEOUT_MS) {
        window.location.href = '/login?timeout=true';
      } else if (elapsed > WARNING_MS) {
        setIsTimingOut(true);
        setTimeLeft(Math.floor((TIMEOUT_MS - elapsed) / 1000));
      } else {
        setIsTimingOut(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastActivity, setIsTimingOut]);

  return (
    <>
      {children}
      <Modal
        isOpen={isTimingOut}
        onClose={() => {}} // User MUST take action
        title="Session Security Alert"
        maxWidth="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => window.location.href = '/login'}>Logout Now</Button>
            <Button className="flex-1 bg-blue-600" onClick={extendSession}>Extend Session</Button>
          </div>
        }
      >
        <div className="py-4 space-y-6 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto animate-pulse border-2 border-amber-100">
            <Clock size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Security Timeout Imminent</h4>
            <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto">
              Your session will expire in <span className="font-black text-blue-600">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span> due to inactivity.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 text-left">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              Unsaved data in open forms may be lost if the session expires. Click extend to continue working.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <SessionProvider>
          <CalendarProvider>
            <SessionManager>
              <Router>
                <React.Suspense fallback={
                  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initializing Module...</p>
                    </div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<RootLayout />}>
                      <Route index element={<DashboardRedirect />} />

                      {/* Admin Routes */}
                      <Route
                        path="admin/*"
                        element={
                          <ProtectedRoute allowedRoles={['admin', 'ADMIN', 'SUPER_ADMIN', 'ACADEMIC_ADMIN']}>
                            <Routes>
                              <Route path="dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                              
                              {/* Standardized Nested Routes to match Sidebar */}
                              <Route path="users">
                                <Route path="teachers" element={<ErrorBoundary><TeachersPage /></ErrorBoundary>} />
                                <Route path="students" element={<ErrorBoundary><StudentsPage /></ErrorBoundary>} />
                              </Route>

                              <Route path="academic">
                                <Route path="sessions" element={<ErrorBoundary><SessionsPage /></ErrorBoundary>} />
                                <Route path="courses" element={<ErrorBoundary><CoursesPage /></ErrorBoundary>} />
                                <Route path="sections" element={<ErrorBoundary><ClassTreePage /></ErrorBoundary>} />
                                <Route path="subjects" element={<ErrorBoundary><SubjectsPage /></ErrorBoundary>} />
                              </Route>

                              <Route path="examination">
                                <Route path="results" element={<ErrorBoundary><ExaminationPage /></ErrorBoundary>} />
                              </Route>

                              {/* Operations */}
                              <Route path="subject-assignment" element={<ErrorBoundary><SubjectAssignmentPage /></ErrorBoundary>} />
                              <Route path="promotion" element={<ErrorBoundary><PromotionPage /></ErrorBoundary>} />
                              <Route path="reports" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
                              <Route path="onboarding" element={<ErrorBoundary><OnboardingWizard /></ErrorBoundary>} />
                              
                              {/* Core Management */}
                              <Route path="fees" element={<ErrorBoundary><FeeManagementPage /></ErrorBoundary>} />
                              <Route path="attendance" element={<ErrorBoundary><AttendancePage /></ErrorBoundary>} />
                              <Route path="notices" element={<ErrorBoundary><AdminNoticesPage /></ErrorBoundary>} />
                              <Route path="settings" element={<ErrorBoundary><AdminSettingsPage /></ErrorBoundary>} />

                              {/* Legacy Redirects for Tests and Backward Compatibility */}
                              <Route path="faculty" element={<Navigate to="users/teachers" replace />} />
                              <Route path="students" element={<Navigate to="users/students" replace />} />
                              <Route path="sessions" element={<Navigate to="academic/sessions" replace />} />
                              <Route path="courses" element={<Navigate to="academic/courses" replace />} />
                              <Route path="subjects" element={<Navigate to="academic/subjects" replace />} />
                              <Route path="departments" element={<Navigate to="academic/departments" replace />} />
                              
                              {/* 404 within Admin */}
                              <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                          </ProtectedRoute>
                        }
                      />

                      {/* Faculty Routes */}
                      <Route
                        path="faculty/*"
                        element={
                          <ProtectedRoute allowedRoles={['teacher', 'mentor', 'FACULTY']}>
                            <Routes>
                              <Route path="dashboard" element={<ErrorBoundary><TeacherDashboard /></ErrorBoundary>} />
                              <Route path="attendance" element={<ErrorBoundary><AttendancePage /></ErrorBoundary>} />
                              <Route path="marks" element={<ErrorBoundary><MarksEntryPage /></ErrorBoundary>} />
                              <Route path="mentor" element={<ErrorBoundary><MentorDashboard /></ErrorBoundary>} />
                            </Routes>
                          </ProtectedRoute>
                        }
                      />

                      {/* Accountant Routes */}
                      <Route
                        path="accountant/*"
                        element={
                          <ProtectedRoute allowedRoles={['accountant', 'ACCOUNTANT', 'ACCOUNTS_ADMIN']}>
                            <Routes>
                              <Route path="dashboard" element={<ErrorBoundary><AccountsDashboard /></ErrorBoundary>} />
                              <Route path="fees" element={<ErrorBoundary><FeeManagementPage /></ErrorBoundary>} />
                              <Route path="ledger" element={<ErrorBoundary><StudentLedgerPage /></ErrorBoundary>} />
                            </Routes>
                          </ProtectedRoute>
                        }
                      />

                      {/* Student Routes */}
                      <Route
                        path="student/*"
                        element={
                          <ProtectedRoute allowedRoles={['student', 'STUDENT']}>
                             <Routes>
                               <Route path="dashboard" element={<ErrorBoundary><StudentDashboard /></ErrorBoundary>} />
                               <Route path="profile" element={<ErrorBoundary><StudentProfile /></ErrorBoundary>} />
                               <Route path="fees" element={<ErrorBoundary><StudentFees /></ErrorBoundary>} />
                               <Route path="marks" element={<ErrorBoundary><StudentMarks /></ErrorBoundary>} />
                               <Route path="attendance" element={<ErrorBoundary><StudentAttendance /></ErrorBoundary>} />
                               <Route path="notices" element={<ErrorBoundary><StudentNotices /></ErrorBoundary>} />
                               <Route path="timetable" element={<ErrorBoundary><StudentTimetable /></ErrorBoundary>} />
                               <Route path="backlogs" element={<ErrorBoundary><BacklogsPage /></ErrorBoundary>} />
                               <Route path="documents" element={<ErrorBoundary><DocumentsPage /></ErrorBoundary>} />
                             </Routes>
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    <Route path="/login" element={<Login />} />

                    {/* Final fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </React.Suspense>
              </Router>
            </SessionManager>
          </CalendarProvider>
        </SessionProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
