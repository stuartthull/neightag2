import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CalendarEntry } from '../utils/calendar-types';
import '../css/calendar.css';
import withSubscriptionProtection from '../components/with-subscription-protection';

// Extend the core CalendarEntry type to include our optional joined horse object metadata
interface ExtendedCalendarEntry extends CalendarEntry {
    equi_log_main?: {
        horse_name: string;
    };
}

function CalendarView(): React.JSX.Element {
    const navigate = useNavigate();
    const [events, setEvents] = useState<ExtendedCalendarEntry[]>([]);
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
        // 🐴 Joined equi_log_main to securely retrieve the associated horse_name text values
        const { data, error } = await supabase
            .from('equi_calendar')
            .select(`
                *,
                equi_log_main (
                    horse_name
                )
            `)
            .eq('user_uuid', userId)
            .order('calendar_date', { ascending: true })
            .order('calendar_time', { ascending: true });

        if (error) {
            console.error("Error drawing targeted user calendar records:", error.message);
        } else {
            setEvents(data as any[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (sessionUserId) {
            fetchUserCalendar(sessionUserId);
        }
    }, [sessionUserId]);

    // 🕒 Split arrays based on today's date context
    // Stripping the time string guarantees calendar dates match accurately across days
    const todayStr = new Date().toISOString().split('T')[0];

    const upcomingEvents = events.filter(event => event.calendar_date >= todayStr);

    // Reverse past events so the most recent ones show up first in history
    const pastEvents = events
        .filter(event => event.calendar_date < todayStr)
        .reverse();

    // Reusable function to render an event card asset
    const renderEventCard = (event: ExtendedCalendarEntry, isPast: boolean) => {
        const horseName = event.equi_log_main?.horse_name;

        return (
            <div
                key={event.id}
                className={`card calendar-event-card marginbsixteen ${isPast ? 'past-event-card' : ''}`}
                style={isPast ? { opacity: 0.7, borderLeft: '3px solid #cbd5e1' } : undefined}
            >
                <div className="calendar-card-header">
                    <div>
                        <h3 className="calendar-card-title">
                            {/* Prepend horse name to event title if it maps correctly */}
                            {horseName ? `${horseName} • ` : ''}{event.calendar_title}{' '}
                            {isPast && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal', marginLeft: '6px' }}>(Past)</span>}
                        </h3>
                    </div>

                    <div className="calendar-date-badge">
                        <div>📅 {new Date(event.calendar_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: isPast ? 'numeric' : undefined })}</div>
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
        );
    };

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
                    <div className="calendar-empty-state">
                        <p>Your schedule grid is empty.</p>
                        <Link to="/calendar/add" className="calendar-empty-state-link">
                            Add your first entry now
                        </Link>
                    </div>
                ) : (
                    <div className="calendar-events-list">

                        {/* 📅 UPCOMING EVENTS SECTION */}
                        <div className="marginbsixteen">
                            <h2 className="textmedium marginbsixteen">
                                🗓️ Upcoming Schedule
                            </h2>

                            {upcomingEvents.length === 0 ? (
                                <p style={{ color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>No upcoming bookings planned.</p>
                            ) : (
                                upcomingEvents.map(event => renderEventCard(event, false))
                            )}
                        </div>

                        {/* ⏳ PAST HISTORICAL EVENTS SECTION */}
                        {pastEvents.length > 0 && (
                            <div>
                                <h2 className="textmedium marginbsixteen">
                                    ⏳ Past Events History
                                </h2>
                                <div className="past-events-wrapper">
                                    {pastEvents.map(event => renderEventCard(event, true))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

export default withSubscriptionProtection(CalendarView, { requireAuthentication: true });