import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a date string (potentially lacking timezone) as UTC.
 */
export function parseUtcDate(date: string | Date | number): Date {
  if (!date) return new Date(); // Fallback/Error case
  let dateObj: Date;

  if (typeof date === 'string') {
    // If contains separators but no timezone (Z or +00:00), assume UTC
    // Regex checks for "YYYY-MM-DD" or similar start, and assumes no "Z" or "+" at end parts
    if (date.match(/^\d{4}-\d{2}-\d{2}/) && !date.match(/Z$|[+-]\d{2}:?\d{2}$/)) {
      dateObj = new Date(date + 'Z');
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date(date);
  }
  return dateObj;
}

export function formatTimestamp(date: string | Date | number): string {
  if (!date) return '-';
  try {
    const dateObj = parseUtcDate(date);

    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return String(date);
    }

    return dateObj.toLocaleString();
  } catch (e) {
    return String(date);
  }
}
