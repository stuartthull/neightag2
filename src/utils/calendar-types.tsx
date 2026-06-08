export interface CalendarEntry {
    id: number;
    created_at: string;
    user_uuid: string;
    calendar_date: string;  // Format: 'YYYY-MM-DD'
    calendar_title: string;
    calendar_time: string;  // Format: 'HH:MM:SS'
    calendar_notes: string;
}