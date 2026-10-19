import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface HorseSummary {
    horse_name: string;
}

export default function AddFarrierCalendarEntry(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const [horse, setHorse] = useState<HorseSummary | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadHorse = async () => {
            if (!horse_uuid) {
                setErrorMessage('The scanned horse could not be identified.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('equi_log_main')
                .select('horse_name')
                .eq('horse_uuid', horse_uuid)
                .maybeSingle();

            if (cancelled) return;
            if (error || !data) {
                setErrorMessage('This horse could not be found. Please check the QR code and try again.');
            } else {
                setHorse(data);
            }
            setLoading(false);
        };

        void loadHorse();
        return () => {
            cancelled = true;
        };
    }, [horse_uuid]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!horse_uuid || !horse) return;

        setSaving(true);
        setErrorMessage('');
        const { error } = await supabase.rpc('submit_farrier_appointment_request', {
            target_horse_uuid: horse_uuid,
            appointment_date: date,
            appointment_time: time || null,
            appointment_notes: notes,
        });

        setSaving(false);
        if (error) {
            setErrorMessage(`Unable to save the farrier appointment: ${error.message}`);
            return;
        }

        setSaved(true);
    };

    if (loading) {
        return <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>Loading horse details…</div>;
    }

    return (
        <main className="page-wrapper">
            <div className="page-container" style={{ maxWidth: '640px' }}>
                <section className="section-container white-section-container">
                    <h1 className="textbig marginbeight">Farrier Appointment</h1>
                    {horse ? (
                        <>
                            <p className="text-normal marginbsixteen">
                                {saved
                                    ? `Your request has been sent to ${horse.horse_name}'s owner. It will only be added to the calendar if approved.`
                                    : <>Request a Farrier Visit for <strong>{horse.horse_name}</strong>. The horse owner must approve it before it appears on the calendar.</>}
                            </p>
                            {!saved && <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label htmlFor="farrier-date" style={{ fontWeight: 600 }}>Appointment date *</label>
                                    <input
                                        id="farrier-date"
                                        type="date"
                                        value={date}
                                        onChange={(event) => setDate(event.target.value)}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label htmlFor="farrier-time" style={{ fontWeight: 600 }}>Time</label>
                                    <input
                                        id="farrier-time"
                                        type="time"
                                        value={time}
                                        onChange={(event) => setTime(event.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label htmlFor="farrier-notes" style={{ fontWeight: 600 }}>Notes</label>
                                    <textarea
                                        id="farrier-notes"
                                        value={notes}
                                        onChange={(event) => setNotes(event.target.value)}
                                        placeholder="Add any details for this visit"
                                        rows={4}
                                    />
                                </div>
                                {errorMessage && <p role="alert" className="text-normal">{errorMessage}</p>}
                                <button type="submit" className="buttonMain buttonPurple" disabled={saving}>
                                    {saving ? 'Sending request…' : 'Submit appointment request'}
                                </button>
                            </form>}
                        </>
                    ) : (
                        <>
                            <p role="alert" className="text-normal">{errorMessage}</p>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}