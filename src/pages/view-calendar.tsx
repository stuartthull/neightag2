import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CalendarEntry } from '../utils/calendar-types';
import '../css/calendar.css'; // ✅ Imported the newly created css style matrix file here

export default function CalendarView(): React.JSX.Element {
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login');
            } else {
                setSessionUserId(session.user.id);
            }
        });
    }, [navigate]);

    const fetchUserCalendar = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equi_calendar')
            .select('*')
            .eq('user_uuid', userId)
            .order('calendar_date', { ascending: true })
            .order('calendar_time', { ascending: true });

        if (error) {
            console.error("Error drawing targeted user calendar records:", error.message);
        } else {
            setEvents(data as CalendarEntry[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (sessionUserId) {
            fetchUserCalendar(sessionUserId);
        }
    }, [sessionUserId]);

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <div className='marginbsixteen'>
                    <h1 className="textbig">My EquiLog Schedule</h1>
                    <p className="marginbsixteen">Your upcoming clinics, farrier bookings, and reminders.</p>
                    <Link to="/calendar/add" className="buttonSmall buttonPurple">
                        Add Event
                    </Link>
                </div>

                {loading ? (
                    <p>Loading your calendar itinerary...</p>
                ) : events.length === 0 ? (
                    /* ✅ REPLACED WITH CLASS NAMES */
                    <div className="calendar-empty-state">
                        <p>Your schedule grid is empty.</p>
                        <Link to="/calendar/add" className="calendar-empty-state-link">
                            Add your first entry now
                        </Link>
                    </div>
                ) : (
                    /* ✅ REPLACED WITH CLASS NAMES */
                    <div className="calendar-events-list">
                        {events.map((event) => (
                            <div key={event.id} className="card calendar-event-card">
                                <div className="calendar-card-header">
                                    <div>
                                        <h3 className="calendar-card-title">
                                            {event.calendar_title}
                                        </h3>
                                    </div>

                                    <div className="calendar-date-badge">
                                        <div>📅 {new Date(event.calendar_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                        {event.calendar_time && (
                                            <div className="calendar-time-text">⏰ {event.calendar_time.slice(0, 5)}</div>
                                        )}
                                    </div>
                                </div>

                                {event.calendar_notes && (
                                    <p className="calendar-card-notes">
                                        {event.calendar_notes}
                                    </p>
                                )}

                                <Link
                                    to={`/calendar/edit/${event.id}`}
                                    className="calendar-edit-link marginsbeight"
                                >
                                    Edit or Remove Event
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}