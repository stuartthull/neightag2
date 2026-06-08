import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/equilog.css';
import HorseQrCode from '../components/qr-code';

type LogRecord = {
    id: number;
    horse_name: string;
};

export default function Dashboard() {
    const [myLogs, setMyLogs] = useState<LogRecord[]>([]);
    const [horseName, setHorseName] = useState('');
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSessionUserId(data.session?.user?.id ?? null);
        });
    }, []);

    // ✅ FIXED: Only query records when sessionUserId is populated, and add the .eq filter
    const fetchMyLogs = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equi_log_main')
            .select('id, horse_name')
            .eq('user_uuid', userId); // 🔒 Filters rows down to the active user's ID specifically

        if (error) {
            console.error("Error fetching segmented records:", error.message);
        } else {
            setMyLogs((data as LogRecord[]) || []);
        }
        setLoading(false);
    };

    // React to session changes. Once the ID lands safely, load their subset of data
    useEffect(() => {
        if (sessionUserId) {
            fetchMyLogs(sessionUserId);
        }
    }, [sessionUserId]);

    const addHorse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!horseName || !sessionUserId) return;

        const { error } = await supabase.from('equi_log_main').insert([{
            horse_name: horseName,
            user_uuid: sessionUserId
        }]);

        if (error) {
            alert(error.message);
        } else {
            setHorseName('');
            fetchMyLogs(sessionUserId);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <h1 className="textbig">Your Stable</h1>
                    <p className="text-normal">Manage your horses and their medical records.</p>
                </section>

                <section className="section-container white-section-container purple-border">


                    {loading ? (
                        <p className="text-normal">Loading your stable profile...</p>
                    ) : myLogs.length === 0 ? (
                        <p className="text-normal" style={{ color: '#64748b', marginBottom: '20px' }}>No horses registered under this account yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px', width: '100%' }}>
                            {myLogs.map(log => (
                                <>
                                    <div key={log.id} style={{ paddingBottom: '8px' }}>
                                        <h2 className="textmedium marginbeight">Registered horse: <strong>{log.horse_name}</strong></h2>

                                        <HorseQrCode horseId={log.id} horseName={log.horse_name} />

                                        <div style={{ margin: '16px 0' }}>
                                            <ul>
                                                <li><Link to={`/horse/${log.id}`} className="text-purple" style={{ fontSize: '0.85rem' }}>View Profile</Link></li>
                                                <li><Link to={`/edit/${log.id}`} className="text-purple" style={{ fontSize: '0.85rem' }}>Edit Details</Link></li>
                                                <li><Link to={`/privacy/${log.id}`} className="text-purple" style={{ fontSize: '0.85rem' }}>Privacy Matrix</Link></li>
                                            </ul>
                                        </div>
                                        <hr />
                                        <div style={{ margin: '16px 0 0' }}>
                                            <ul>
                                                <li><Link to={`/calendar`} className="text-purple" style={{ fontSize: '0.85rem' }}>View Calendar</Link></li>
                                            </ul>
                                        </div>
                                    </div>

                                </>
                            ))}
                        </div>
                    )}
                </section>

                <section className="section-container white-section-container">
                    <h2 className="textmedium marginbeight">Add a New Horse</h2>
                    <form onSubmit={addHorse} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            className="inputText"
                            value={horseName}
                            onChange={e => setHorseName(e.target.value)}
                            placeholder="Enter horse name"
                            required
                        />
                        <button type="submit" className="buttonWhite buttonMain">
                            Add new horse to Stable
                        </button>
                    </form>
                </section>
            </div >
        </div >
    );
}