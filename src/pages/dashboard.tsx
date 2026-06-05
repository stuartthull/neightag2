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

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSessionUserId(data.session?.user?.id ?? null);
        });
    }, []);

    const fetchMyLogs = async () => {
        const { data } = await supabase.from('equi_log_main').select('*');
        setMyLogs((data as LogRecord[]) || []);
    };

    useEffect(() => { fetchMyLogs(); }, []);

    const addHorse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!horseName || !sessionUserId) return;

        await supabase.from('equi_log_main').insert([{
            horse_name: horseName,
            user_uuid: sessionUserId
        }]);

        setHorseName('');
        fetchMyLogs();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Private Stable Records</h1>

            <form onSubmit={addHorse} style={{ marginBottom: '20px' }}>
                <input
                    value={horseName}
                    onChange={e => setHorseName(e.target.value)}
                    placeholder="Enter Horse Name to Register"
                    style={{ padding: '8px', marginRight: '10px' }}
                />
                <button type="submit">Add Horse</button>
            </form>

            <h2>Registered Horses</h2>
            <ul>
                {myLogs.map(log => (
                    <li key={log.id} style={{ display: 'flex', gap: '20px', marginBottom: '10px', alignItems: 'center' }}>
                        <Link to={`/edit/${log.id}`} style={{ color: '#007bff' }}>Edit Logs & Medical details</Link>
                        <Link to={`/privacy/${log.id}`} style={{ color: '#007bff' }}>Edit privacy</Link>
                        <Link to={`/horse/${log.id}`} style={{ fontWeight: 'bold' }}>
                            {log.horse_name}'s Records
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}