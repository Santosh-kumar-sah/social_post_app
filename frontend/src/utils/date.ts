import { formatDistanceToNow } from 'date-fns';

/**
 * Formats an ISO date string or Date object into a human-friendly relative time string.
 * Examples: "2 minutes ago", "just now", "yesterday"
 */
export const formatRelativeTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return 'recently';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
};
