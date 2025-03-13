/**
 * Date Utility Functions
 *
 * This file contains utility functions for date and time formatting
 * to ensure consistent date-time handling throughout the application.
 */

// Format: YYYY-MM-DD HH:mm (e.g., 2006-01-02 15:04)
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm"

/**
 * Format a Date object to the standard format: YYYY-MM-DD HH:mm
 */
export function formatDateToStandard(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * Parse a string in YYYY-MM-DD HH:mm format to a Date object
 */
export function parseStandardDate(dateString: string): Date {
  // Expected format: YYYY-MM-DD HH:mm
  const [datePart, timePart] = dateString.split(" ")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

/**
 * Get date in YYYY-MM-DD format for input fields
 */
export function getDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

/**
 * Get time in HH:mm format for input fields
 */
export function getTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${hours}:${minutes}`
}

/**
 * Combine date and time strings into the standard format
 */
export function combineDateAndTime(dateStr: string, timeStr: string): string {
  return `${dateStr} ${timeStr}`
}

/**
 * Validate if a string is in the correct YYYY-MM-DD HH:mm format
 */
export function isValidDateTimeFormat(dateTimeStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
  if (!regex.test(dateTimeStr)) return false

  try {
    const date = parseStandardDate(dateTimeStr)
    return !isNaN(date.getTime())
  } catch (e) {
    return false
  }
}

/**
 * Get current date and time in the standard format
 */
export function getCurrentDateTime(): string {
  return formatDateToStandard(new Date())
}

/**
 * Format a date for display in a user-friendly format
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format time for display in a user-friendly format
 */
export function formatTimeForDisplay(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format time string (HH:mm) for display
 */
export function formatTimeStringForDisplay(time: string): string {
  const [hour, minute] = time.split(":").map(Number)
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`
}

