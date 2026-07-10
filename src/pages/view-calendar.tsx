import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CalendarEntry } from '../utils/calendar-types';
import '../css/calendar.css';
import withSubscriptionProtection from '../components/with-subscription-protection';

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
        const { data, error } = await supabase
            .from('equi_calendar')
            .select(
                `
                *,
                equi_log_main (
                    horse_name
                )
            `
            )
            .eq('user_uuid', userId)
            .order('calendar_date', { ascending: true })
            .order('calendar_time', { ascending: true });

        if (error) {
            console.error('Error drawing targeted user calendar records:', error.message);
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

    // 🕒 TIMEZONE-SAFE LOCAL DATE BOUNDARY STRIPPING
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // 🚛 SEPARATE HORSE BOX LOGISTICS
    const isHorseBoxEvent = (event: ExtendedCalendarEntry) =>
        event.calendar_title?.toLowerCase().includes('horse box');

    const horseBoxEvents = events.filter((event) => isHorseBoxEvent(event));
    const nonHorseBoxEvents = events.filter((event) => !isHorseBoxEvent(event));

    // Split general schedules safely
    const upcomingEvents = nonHorseBoxEvents.filter((event) => event.calendar_date >= todayStr);
    const pastEvents = nonHorseBoxEvents
        .filter((event) => event.calendar_date < todayStr)
        .reverse();

    const upcomingHorseBox = horseBoxEvents.filter((event) => event.calendar_date >= todayStr);
    const pastHorseBox = horseBoxEvents.filter((event) => event.calendar_date < todayStr).reverse();

    // 📅 HELPER FUNCTION TO GROUP ENTRIES BY MONTH
    const groupEventsByMonth = (eventList: ExtendedCalendarEntry[]) => {
        return eventList.reduce((groups: Record<string, ExtendedCalendarEntry[]>, event) => {
            if (!event.calendar_date) return groups;

            // Generate a clean string like "August 2026"
            const dateObj = new Date(event.calendar_date);
            const monthLabel = dateObj.toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
            });

            if (!groups[monthLabel]) {
                groups[monthLabel] = [];
            }
            groups[monthLabel].push(event);
            return groups;
        }, {});
    };

    const upcomingGrouped = groupEventsByMonth(upcomingEvents);
    const pastGrouped = groupEventsByMonth(pastEvents);

    const renderEventCard = (event: ExtendedCalendarEntry, isPast: boolean) => {
        const horseName = event.equi_log_main?.horse_name;

        return (
            <div
                key={event.id}
                className={`card calendar-event-card marginbsixteen ${isPast ? 'past-event-card' : ''}`}
                style={isPast ? { opacity: 0.65, borderLeft: '3px solid #cbd5e1' } : undefined}
            >
                <div className="calendar-card-header">
                    <div>
                        <h3 className="calendar-card-title">
                            {horseName ? `${horseName} • ` : ''}
                            {event.calendar_title}
                            {isPast && (
                                <span
                                    style={{
                                        fontSize: '0.8rem',
                                        color: '#64748b',
                                        fontWeight: 'normal',
                                        marginLeft: '6px',
                                    }}
                                >
                                    (Past)
                                </span>
                            )}
                        </h3>
                    </div>

                    <div className="calendar-date-badge">
                        <div>
                            📅{' '}
                            {new Date(event.calendar_date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: isPast ? 'numeric' : undefined,
                            })}
                        </div>
                        {event.calendar_time && (
                            <div className="calendar-time-text">
                                ⏰ {event.calendar_time.slice(0, 5)}
                            </div>
                        )}
                    </div>
                </div>

                {event.calendar_notes && (
                    <p className="calendar-card-notes">{event.calendar_notes}</p>
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
                <div className="marginbsixteen">
                    <h1 className="textbig">My EquiLog Schedule</h1>
                    <p className="marginbsixteen">
                        Your upcoming clinics, farrier bookings, and reminders.
                    </p>
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
                        {/* 🗓️ UPCOMING SCHEDULE SECTION BY MONTH */}
                        <div className="marginbsixteen">
                            <h2 className="textmedium" style={{ marginBottom: '20px' }}>
                                🗓️ Upcoming Schedule
                            </h2>
                            {upcomingEvents.length === 0 ? (
                                <p
                                    style={{
                                        color: '#64748b',
                                        fontStyle: 'italic',
                                        padding: '8px 0',
                                    }}
                                >
                                    No upcoming horse bookings planned.
                                </p>
                            ) : (
                                Object.keys(upcomingGrouped).map((monthGroup) => (
                                    <div
                                        key={monthGroup}
                                        className="calendar-month-section"
                                        style={{ marginBottom: '24px' }}
                                    >
                                        <h3 className="textmedium">{monthGroup}</h3>
                                        {upcomingGrouped[monthGroup].map((event) =>
                                            renderEventCard(event, false)
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 🚛 HORSE BOX LOGISTICS */}
                        {(upcomingHorseBox.length > 0 || pastHorseBox.length > 0) && (
                            <div
                                style={{
                                    marginTop: '32px',
                                    backgroundColor: '#f8fafc',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <h2 className="textmedium marginbsixteen">
                                    🚛 Horse Box Maintenance & Dates
                                </h2>

                                {upcomingHorseBox.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <h3
                                            className="text-normal"
                                            style={{
                                                color: '#475569',
                                                marginBottom: '8px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Upcoming Maintenance:
                                        </h3>
                                        {upcomingHorseBox.map((event) =>
                                            renderEventCard(event, false)
                                        )}
                                    </div>
                                )}

                                {pastHorseBox.length > 0 && (
                                    <div>
                                        <h3
                                            className="text-normal"
                                            style={{
                                                color: '#475569',
                                                marginBottom: '8px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Past Service History:
                                        </h3>
                                        {pastHorseBox.map((event) => renderEventCard(event, true))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ⏳ PAST HISTORICAL EVENTS Display BY MONTH */}
                        <div style={{ marginTop: '40px' }}>
                            <h2 className="textmedium" style={{ marginBottom: '20px' }}>
                                ⏳ Past Horse Events History
                            </h2>
                            {pastEvents.length === 0 ? (
                                <p
                                    style={{
                                        color: '#64748b',
                                        fontStyle: 'italic',
                                        padding: '8px 0',
                                    }}
                                >
                                    No historical horse logs found in your calendar.
                                </p>
                            ) : (
                                Object.keys(pastGrouped).map((monthGroup) => (
                                    <div
                                        key={monthGroup}
                                        className="calendar-month-section"
                                        style={{ marginBottom: '24px' }}
                                    >
                                        <h3
                                            className="text-normal"
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#475569',
                                                borderBottom: '1px solid #e2e8f0',
                                                paddingBottom: '4px',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            {monthGroup}
                                        </h3>
                                        <div className="past-events-wrapper">
                                            {pastGrouped[monthGroup].map((event) =>
                                                renderEventCard(event, true)
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withSubscriptionProtection(CalendarView, { requireAuthentication: true });
