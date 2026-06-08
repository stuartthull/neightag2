import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function EditCalendarEntry(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    // Controlled form state matching table schema defaults
    const [title, setTitle] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        // Enforce session check on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login');
            } else {
                setUserId(session.user.id);
            }
        });
    }, [navigate]);

    useEffect(() => {
        // Only fetch the record once we have verified both the resource ID and the user session
        if (!id || !userId) return;

        const fetchEventDetails = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('equi_calendar')
                .select('*')
                .eq('id', id)
                .eq('user_uuid', userId) // 🔒 Scope security check right at selection level
                .single();

            if (error) {
                console.error("Error retrieving calendar data:", error.message);
                alert("Could not load this calendar entry or you do not have permission to edit it.");
                navigate('/calendar');
                return;
            }

            if (data) {
                setTitle(data.calendar_title);
                setDate(data.calendar_date);
                setTime(data.calendar_time ? data.calendar_time.slice(0, 5) : ''); // Trims HH:MM:SS down to HH:MM for input compatibility
                setNotes(data.calendar_notes || '');
            }
            setLoading(false);
        };

        fetchEventDetails();
    }, [id, userId, navigate]);

    // Inside handleUpdate in EditCalendarEntry.tsx
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!id || !userId) return;
        setSaving(true);

        const { error } = await supabase
            .from('equi_calendar')
            .update({
                calendar_title: title,
                calendar_date: date,
                calendar_time: time || null,
                calendar_notes: notes
            })
            .eq('id', parseInt(id, 10)) // 🛠️ FIX: Force string parameter to Number matching BIGINT
            .eq('user_uuid', userId);

        setSaving(false);

        if (error) {
            alert(`Update failed: ${error.message}`);
        } else {
            alert('Calendar event updated successfully!');
            navigate('/calendar');
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!id || !userId) return;

        const confirmDelete = window.confirm("Are you sure you want to remove this event from your schedule?");
        if (!confirmDelete) return;

        setSaving(true);
        const { error } = await supabase
            .from('equi_calendar')
            .delete()
            .eq('id', id)
            .eq('user_uuid', userId); // 🔒 Ensures users can't delete rows blindly

        setSaving(false);

        if (error) {
            alert(`Deletion failed: ${error.message}`);
        } else {
            navigate('/calendar');
        }
    };

    if (loading) return <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>Retrieving event specifications...</div>;

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
            <button onClick={() => navigate('/calendar')} className="back-link" style={{ marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b21a8', textDecoration: 'underline' }}>
                ← Cancel & Return
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Modify Event Details</h2>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                    Delete Event
                </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600' }}>Event Title *</label>
                    <input
                        type="text"
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
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="buttonMain buttonPurple"
                    style={{ marginTop: '10px', width: '100%' }}
                >
                    {saving ? 'Updating entry context...' : 'Save Structural Changes'}
                </button>
            </form>
        </div>
    );
}