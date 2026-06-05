import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/equilog.css';

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

                <section className="section-container white-section-container">
                    <h2 className="textmedium marginbeight">Registered Horses</h2>

                    {loading ? (
                        <p className="text-normal">Loading your stable profile...</p>
                    ) : myLogs.length === 0 ? (
                        <p className="text-normal" style={{ color: '#64748b', marginBottom: '20px' }}>No horses registered under this account yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {myLogs.map(log => (
                                <div key={log.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                    <div className="text-normal"><strong>{log.horse_name}</strong></div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        <Link to={`/horse/${log.id}`} className="text-purple" style={{ fontSize: '0.85rem' }}>View Profile</Link>
                                        <Link to={`/edit/${log.id}`} className="text-purple" style={{ fontSize: '0.85rem' }}>Edit Details</Link>
                                        <Link to={`/privacy/${log.id}`} className="text-purple" style={{ fontSize: '0.85rem' }}>Privacy Matrix</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="section-container purple-section-container">
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
                            Add Horse to Stable
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}