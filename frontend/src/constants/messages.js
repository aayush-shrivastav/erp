export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is mandatory",
  MARKS_EXCEEDED: (limit) => `Marks cannot exceed ${limit}`,
  INVALID_ENROLLMENT: "Please enter a valid enrollment number",
  SESSION_RESTORED: "Unsaved progress has been restored",
  AUDIT_REASON_REQUIRED: "Reason is required for this administrative action"
};

export const ACTION_MESSAGES = {
  SAVE_SUCCESS: "Changes synchronized successfully",
  SAVE_ERROR: "Sync failed. Data saved locally.",
  PROMOTION_SUCCESS: (count, sem) => `Successfully promoted ${count} students to Semester ${sem}`,
  TRANSFER_SUCCESS: (section) => `Student successfully transferred to Section ${section}`,
  ROLLBACK_SUCCESS: "Promotion batch has been reverted",
  SESSION_EXPIRED: "Session expired due to inactivity"
};

export const CONFIRMATION_MESSAGES = {
  ROLLBACK: "Are you sure you want to rollback this promotion? This action is permanent and logged.",
  UNSAVED_CHANGES: "You have unsaved changes. Leaving now will discard your progress."
};
