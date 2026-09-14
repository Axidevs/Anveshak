/**
 * Utility helpers for the Anveshak application.
 */

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr, locale = 'en-IN') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateStr, locale = 'en-IN') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Generate a unique tracking ID
 */
export function generateTrackingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'NS-TRK-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Generate a unique FIR ID
 */
export function generateFIRId() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `FIR-${year}-DL-${num}`;
}

/**
 * Get status color classes based on status value
 */
export function getStatusColor(status) {
  const colorMap = {
    filed: { bg: 'bg-saffron-100', text: 'text-saffron-800', dot: 'bg-saffron' },
    underInvestigation: { bg: 'bg-navy-100', text: 'text-navy-800', dot: 'bg-navy' },
    chargesheet: { bg: 'bg-navy-200', text: 'text-navy-900', dot: 'bg-navy-700' },
    courtRegistered: { bg: 'bg-forest-100', text: 'text-forest-800', dot: 'bg-forest' },
    disposed: { bg: 'bg-forest-100', text: 'text-forest-900', dot: 'bg-forest-700' },
    resolved: { bg: 'bg-forest-100', text: 'text-forest-900', dot: 'bg-forest-700' },
    pending: { bg: 'bg-saffron-100', text: 'text-saffron-800', dot: 'bg-saffron' },
    active: { bg: 'bg-navy-100', text: 'text-navy-800', dot: 'bg-navy' },
    urgent: { bg: 'bg-alert-100', text: 'text-alert-700', dot: 'bg-alert' },
    hearing: { bg: 'bg-navy-100', text: 'text-navy-800', dot: 'bg-navy' },
    court: { bg: 'bg-forest-100', text: 'text-forest-800', dot: 'bg-forest' },
    scheduled: { bg: 'bg-navy-100', text: 'text-navy-700', dot: 'bg-navy-500' },
    completed: { bg: 'bg-forest-100', text: 'text-forest-800', dot: 'bg-forest' },
  };
  return colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority) {
  const colorMap = {
    critical: { bg: 'bg-alert-100', text: 'text-alert-700', border: 'border-alert' },
    high: { bg: 'bg-saffron-100', text: 'text-saffron-800', border: 'border-saffron' },
    medium: { bg: 'bg-navy-100', text: 'text-navy-700', border: 'border-navy-300' },
    low: { bg: 'bg-forest-100', text: 'text-forest-700', border: 'border-forest-300' },
  };
  return colorMap[priority] || colorMap.medium;
}

/**
 * Calculate time remaining from an expiry date
 */
export function getTimeRemaining(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;
  
  if (diffMs <= 0) return 'Expired';
  
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get the step index for a status in the FIR lifecycle
 */
export function getStatusStepIndex(status) {
  const steps = ['filed', 'underInvestigation', 'chargesheet', 'courtRegistered', 'disposed'];
  const idx = steps.indexOf(status);
  return idx >= 0 ? idx : 0;
}

/**
 * Simple class name merger
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
