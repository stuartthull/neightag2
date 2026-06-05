import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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
        <div className="page-container">
            <section className="section-container white-section-container">
                <h2 style={{ marginBottom: '20px' }}>Registered Horses</h2>

                {loading ? (
                    <p>Loading your stable profile...</p>
                ) : myLogs.length === 0 ? (
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>No horses registered under this account yet.</p>
                ) : (
                    myLogs.map(log => (
                        <ul key={log.id} className="marginbsixteen">
                            <li><p className="marginbsixteen">
                                <Link to={`/edit/${log.id}`}>Edit Logs & Medical details</Link>
                            </p></li>
                            <li><p className="marginbsixteen">
                                <Link to={`/privacy/${log.id}`}>Edit privacy</Link>
                            </p></li>
                            <li><p className="marginbsixteen">
                                <Link to={`/horse/${log.id}`} >
                                    {log.horse_name}'s Records
                                </Link>
                            </p></li>
                        </ul >
                    ))
                )}

                <hr />

                <form onSubmit={addHorse} style={{ marginBottom: '20px' }}>
                    <input
                        value={horseName}
                        onChange={e => setHorseName(e.target.value)}
                        placeholder="Enter name"
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button type="submit" className="buttonMain buttonPurple">Add Horse</button>
                </form>
            </section>
        </div>
    );
}