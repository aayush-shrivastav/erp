/**
 * Formats a number as Indian Currency (INR)
 * @param {number} amount 
 * @returns {string} e.g. "₹80,000"
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

/**
 * Formats a number with Indian thousand separators
 * @param {number} n 
 * @returns {string} e.g. "1,20,000"
 */
export const formatNumber = (n) =>
  new Intl.NumberFormat("en-IN").format(n);

/**
 * Formats a date string to Indian standard
 * @param {string} dateStr 
 * @returns {string} e.g. "15 Jul 2024"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });
};

/**
 * Calculates and formats a percentage
 * @param {number} n 
 * @param {number} total 
 * @returns {string} e.g. "82.3%" or "—"
 */
export const formatPercent = (n, total) =>
  total === 0 ? "—" : `${((n / total) * 100).toFixed(1)}%`;
