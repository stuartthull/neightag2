import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AddCalendarEntry(): React.JSX.Element {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Controlled form state
    const [title, setTitle] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        // Enforce active session capture on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                alert("Please log in to add calendar events.");
                navigate('/login');
            } else {
                setUserId(session.user.id);
            }
        });
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!userId) return;
        setLoading(true);

        const { error } = await supabase
            .from('equi_calendar')
            .insert([
                {
                    user_uuid: userId,
                    calendar_date: date,
                    calendar_title: title,
                    calendar_time: time || null, // Fallback gracefully if blank
                    calendar_notes: notes
                }
            ]);

        setLoading(false);

        if (error) {
            alert(`Error saving event: ${error.message}`);
        } else {
            alert('Event added to your EquiLog calendar!');
            navigate('/calendar'); // Route back to schedule view
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <button onClick={() => navigate(-1)} className="back-link" style={{ marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b21a8', textDecoration: 'underline' }}>
                ← Back
            </button>

            <h2 style={{ marginBottom: '20px' }}>Schedule New Event</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600' }}>Event Title *</label>
                    <input
                        type="text"
                        placeholder="e.g., Cross Country with Bob"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600' }}>Date *</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600' }}>Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600' }}>Notes / Description</label>
                    <textarea
                        placeholder="Add secondary treatment details, arena locations, etc."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="buttonMain buttonPurple"
                    style={{ marginTop: '10px', width: '100%' }}
                >
                    {loading ? 'Saving Entry...' : 'Save Calendar Event'}
                </button>
            </form>
        </div>
    );
}