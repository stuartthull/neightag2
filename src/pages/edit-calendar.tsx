import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/calendar.css';

export default function EditCalendarEntry(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

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
        setConfirmationMessage(null);
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
            setConfirmationMessage('Calendar event updated successfully.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (loading) return <div className="loading-indicator">Retrieving event specifications...</div>;

    return (
        <div className="page-wrapper">
            <div className="page-container">
            {/* ALERT NOTIFICATION BANNER */}
            {confirmationMessage && (
                <div className="calendar-confirmation-message" role="status" aria-live="polite">
                    {confirmationMessage}
                </div>
            )}

                <section className="section-container purple-section-container">
                    <button type="button" onClick={() => navigate('/calendar')} className="buttonWhite buttonMain marginbsixteen">
                        ← Cancel & Return
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 className="textbig">Modify Event Details</h1>
                        </div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={saving}
                            className="button-danger-outline"
                        >
                            Delete Event
                        </button>
                    </div>
                </section>


            {/* MANAGE ENTRY DATA COMPONENT FORM */}
            <form onSubmit={handleUpdate} className="equi-edit-form">

                {/* EVENT TITLE INPUT */}
                <div className="horsebox-field-group">
                    <label className="form-field-label">Event Title *</label>
                    <input
                        type="text"
                        className="form-input-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* TIMELINE PARAMETERS GRID ROW */}
                <div className="form-field-grid">
                    <div className="horsebox-field-group">
                        <label className="form-field-label">Date *</label>
                        <input
                            type="date"
                            className="form-input-control"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="horsebox-field-group">
                        <label className="form-field-label">Time</label>
                        <input
                            type="time"
                            className="form-input-control"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* ADDITIONAL ENTRY DESCRIPTION RECORD NOTES */}
                <div className="horsebox-field-group">
                    <label className="form-field-label">Notes / Description</label>
                    <textarea
                        className="form-textarea-control"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* FORM UPDATE SUBMISSION UTILITY BUTTON */}
                <button
                    type="submit"
                    disabled={saving}
                    className="buttonMain buttonPurple form-submit-btn"
                >
                    {saving ? 'Updating entry context...' : 'Save Changes'}
                </button>
            </form>
        </div>
        </div>
    );
}