/**
 * Date utility functions
 */

/**
 * Format a timestamp to a readable format
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If it's today
  if (date.toDateString() === now.toDateString()) {
    return `Heute, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // If it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Gestern, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Otherwise, return the date
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('de-DE', options);
}

/**
 * Format a date object to a readable date string
 * @param {Date} date - JavaScript date object
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('de-DE', options);
}

/**
 * Format a date to time string
 * @param {Date} date - JavaScript date object
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Get relative time (e.g., "2 days ago", "just now")
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Relative time string
 */
export function getRelativeTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) {
    return 'Gerade eben';
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `Vor ${minutesAgo} ${minutesAgo === 1 ? 'Minute' : 'Minuten'}`;
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `Vor ${hoursAgo} ${hoursAgo === 1 ? 'Stunde' : 'Stunden'}`;
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) {
    return `Vor ${daysAgo} ${daysAgo === 1 ? 'Tag' : 'Tagen'}`;
  }
  
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `Vor ${monthsAgo} ${monthsAgo === 1 ? 'Monat' : 'Monaten'}`;
  }
  
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `Vor ${yearsAgo} ${yearsAgo === 1 ? 'Jahr' : 'Jahren'}`;
} 