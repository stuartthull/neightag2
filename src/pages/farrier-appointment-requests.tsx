import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface FarrierAppointmentRequest {
    id: number;
    created_at: string;
    appointment_date: string;
    appointment_time: string | null;
    appointment_notes: string;
}

interface HorseSummary {
    horse_name: string;
}

function formatDate(value: string): string {
    return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB');
}

export default function FarrierAppointmentRequests(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [horse, setHorse] = useState<HorseSummary | null>(null);
    const [requests, setRequests] = useState<FarrierAppointmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [notice, setNotice] = useState('');

    const loadRequests = useCallback(async () => {
        if (!horse_uuid) {
            setErrorMessage('The horse could not be identified.');
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }

        const { data: horseData, error: horseError } = await supabase
            .from('equi_log_main')
            .select('horse_name')
            .eq('horse_uuid', horse_uuid)
            .eq('user_uuid', user.id)
            .maybeSingle();

        if (horseError || !horseData) {
            setErrorMessage('This horse could not be found in your stable.');
            setLoading(false);
            return;
        }

        setHorse(horseData);
        const { data, error } = await supabase
            .from('equi_farrier_appointment_requests')
            .select('id, created_at, appointment_date, appointment_time, appointment_notes')
            .eq('horse_uuid', horse_uuid)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            setErrorMessage(`Could not load appointment requests: ${error.message}`);
        } else {
            setRequests((data as FarrierAppointmentRequest[]) || []);
        }
        setLoading(false);
    }, [horse_uuid, navigate]);

    useEffect(() => {
        void loadRequests();
    }, [loadRequests]);

    const reviewRequest = async (requestId: number, approve: boolean) => {
        setSavingId(requestId);
        setErrorMessage('');
        setNotice('');

        const { error } = await supabase.rpc('review_farrier_appointment_request', {
            target_request_id: requestId,
            approve_request: approve,
        });

        setSavingId(null);
        if (error) {
            setErrorMessage(`Could not ${approve ? 'approve' : 'reject'} this request: ${error.message}`);
            return;
        }

        setRequests((current) => current.filter((request) => request.id !== requestId));
        setNotice(approve ? 'Appointment request approved and added to the horse calendar.' : 'Appointment request rejected.');
    };

    if (loading) {
        return <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>Loading farrier appointment requests…</div>;
    }

    return (
        <main className="page-wrapper">
            <div className="page-container" style={{ maxWidth: '760px' }}>
                <section className="section-container white-section-container">
                    <button
                        type="button"
                        className="back-link"
                        onClick={() => navigate(`/dashboard`)}
                        style={{ marginBottom: '20px' }}
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="textbig marginbeight">Farrier Appointment Requests</h1>
                    {horse && <p className="text-normal marginbsixteen">Requests for <strong>{horse.horse_name}</strong>.</p>}
                    {errorMessage && <p role="alert" className="text-normal">{errorMessage}</p>}
                    {notice && <p role="status" className="text-normal">{notice}</p>}
                    {!errorMessage && requests.length === 0 ? (
                        <p className="text-normal">There are no pending appointment requests.</p>
                    ) : (
                        requests.map((request) => (
                            <article className="card marginbsixteen" key={request.id}>
                                <h2 className="textmedium">Proposed Farrier Visit</h2>
                                <p className="text-normal marginbeight">
                                    <strong>Date:</strong> {formatDate(request.appointment_date)}
                                    {request.appointment_time && <> at {request.appointment_time.slice(0, 5)}</>}
                                </p>
                                <p className="text-small marginbeight">
                                    <strong>Submitted:</strong> {new Date(request.created_at).toLocaleString('en-GB')}
                                </p>
                                {request.appointment_notes && (
                                    <p className="text-normal marginbeight">
                                        <strong>Notes:</strong><br />{request.appointment_notes}
                                    </p>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    <button
                                        type="button"
                                        className="buttonMain buttonPurple"
                                        disabled={savingId !== null}
                                        onClick={() => void reviewRequest(request.id, true)}
                                    >
                                        {savingId === request.id ? 'Processing…' : 'Approve and add to calendar'}
                                    </button>
                                    <button
                                        type="button"
                                        className="buttonMain buttonOrange"
                                        disabled={savingId !== null}
                                        onClick={() => void reviewRequest(request.id, false)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </div>
        </main>
    );
}
