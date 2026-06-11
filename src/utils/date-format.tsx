/**
 * Formats an ISO date string into a Great Britain human-readable format.
 * @param dateStr - The date string to format (e.g., '2026-06-05')
 * @param variant - 'short' (05/06/2026) or 'long' (5 June 2026)
 */
export function formatGBDate(dateStr: string, variant: 'short' | 'long' = 'long'): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);

    // Check if the date object is valid before formatting
    if (isNaN(date.getTime())) {
        return dateStr;
    }

    if (variant === 'short') {
        // Returns: 05/06/2026
        return date.toLocaleDateString('en-GB');
    }

    // Returns: 5 June 2026
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}