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
        <div className="page-container">

            <h2 style={{ marginBottom: '20px' }}>Registered Horses</h2>
            {myLogs.map(log => (
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
            }
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

        </div >
    );
}