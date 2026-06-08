import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CalendarEntry } from '../utils/calendar-types'; // Adjust your custom types folder import target pathway path

export default function CalendarView(): React.JSX.Element {
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);

    useEffect(() => {
        // 1. Intercept security token
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login');
            } else {
                setSessionUserId(session.user.id);
            }
        });
    }, [navigate]);

    // 2. Fetch data restricted exclusively to user_uuid profile matches
    const fetchUserCalendar = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equi_calendar')
            .select('*')
            .eq('user_uuid', userId) // 🔒 Security Filter Protection Check Gate
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
        <div className="page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 className="textbig" style={{ margin: 0 }}>My EquiLog Schedule</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Your upcoming clinics, farrier bookings, and reminders.</p>
                </div>
                <Link to="/calendar/add" className="buttonMain buttonPurple" style={{ textDecoration: 'none' }}>
                    + Schedule Event
                </Link>
            </div>

            {loading ? (
                <p>Loading your calendar itinerary...</p>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>Your schedule grid is empty.</p>
                    <Link to="/calendar/add" style={{ color: '#6b21a8', display: 'inline-block', marginTop: '10px', fontWeight: '600' }}>Add your first entry now</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="card"
                            style={{
                                padding: '20px',
                                borderRadius: '10px',
                                borderLeft: '5px solid #6b21a8',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1e293b' }}>
                                        {event.calendar_title}
                                    </h3>
                                    <Link
                                        to={`/calendar/edit/${event.id}`}
                                        style={{ color: '#6b21a8', fontSize: '0.85rem', textDecoration: 'underline', fontWeight: '500' }}
                                    >
                                        Edit or Remove Event
                                    </Link>
                                    {event.calendar_notes && (
                                        <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {event.calendar_notes}
                                        </p>
                                    )}
                                </div>

                                <div style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'right' }}>
                                    <div>📅 {new Date(event.calendar_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                    {event.calendar_time && <div style={{ marginTop: '2px', color: '#581c87' }}>⏰ {event.calendar_time.slice(0, 5)}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}