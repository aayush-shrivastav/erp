export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  ACCOUNTS: 'accounts',
  STUDENT: 'student'
};

export const MARKS_LIMITS = {
  MST: 24,
  TOTAL_INTERNAL: 40,
  BEST_OF: 2
};

export const ATTENDANCE_THRESHOLDS = {
  SHORTAGE: 75,
  CRITICAL: 60
};

export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIAL: 'partial',
  OVERDUE: 'overdue'
};

export const FUNDING_TYPES = {
  SELF: 'SELF',
  DRCC: 'DRCC',
  SCHOLARSHIP: 'SCHOLARSHIP'
};

export const SESSION_TIMEOUT = {
  TOTAL: 30 * 60 * 1000, // 30 mins
  WARNING: 25 * 60 * 1000 // 25 mins
};
