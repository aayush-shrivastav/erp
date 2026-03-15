import { useLocation } from 'react-router-dom';

const useBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const crumbMap = {
        'admin': 'Admin',
        'dashboard': 'Dashboard',
        'academic': 'Academic',
        'sessions': 'Sessions',
        'courses': 'Courses',
        'semesters': 'Semesters',
        'sections': 'Sections',
        'subjects': 'Subjects',
        'teachers': 'Teachers',
        'students': 'Students',
        'subject-assignment': 'Subject Assignment',
        'class-tree': 'Academic Hierarchy',
        'promotion': 'Promotion Module',
        'attendance': 'Attendance',
        'marks': 'Internal Marks',
        'marks-entry': 'Marks Entry',
        'mentor': 'Mentor Hub',
        'student': 'Student',
        'profile': 'Profile Setup',
        'my-attendance': 'My Attendance',
        'internal-marks': 'Internal Marks',
        'results': 'Results',
        'accounts': 'Accounts',
        'fees': 'Fee Collection',
        'ledger': 'Student Ledger',
        'defaulters': 'Defaulters',
        'drcc': 'DRCC Reconciliation'
    };

    const breadcrumbs = pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        
        const label = crumbMap[value] || (value.match(/\d/) ? 'Detail' : value.charAt(0).toUpperCase() + value.slice(1));

        return {
            label,
            path: to,
            active: last
        };
    });

    return breadcrumbs;
};

export default useBreadcrumbs;
