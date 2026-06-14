import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import HorseQrCode from '../components/qr-code';

type LogRecord = {
    id: number;
    user_uuid: string;
    horse_uuid: string; // ✅ Added to type definitions
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

    const fetchMyLogs = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equi_log_main')
            .select('id, user_uuid, horse_uuid, horse_name') // ✅ Added horse_uuid to database selectors
            .eq('user_uuid', userId);

        if (error) {
            console.error("Error fetching segmented records:", error.message);
        } else {
            setMyLogs((data as LogRecord[]) || []);
        }
        setLoading(false);
    };

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
            // Clear local input memory before waiting for database reads to cycle back
            setHorseName('');
            await fetchMyLogs(sessionUserId); // ✅ Awaiting ensures your list updates with complete server records
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container no-print">
                    <h1 className="textbig">Your Stable</h1>
                    <p className="text-normal">Manage your horses and their medical records.</p>
                </section>

                {loading ? (
                    <section className="section-container white-section-container purple-border no-print marginbsixteen">
                        <p className="text-normal">Loading your stable profile...</p>
                    </section>
                ) : myLogs.length === 0 ? (
                    <section className="section-container white-section-container purple-border no-print marginbsixteen">
                        <p className="text-normal" style={{ color: '#64748b', marginBottom: '20px' }}>No horses registered under this account yet.</p>
                    </section>
                ) : (
                    <>
                        {myLogs.map(log => (
                            <React.Fragment key={log.id}>
                                <section className="section-container white-section-container purple-border no-print marginbsixteen">
                                    <h2 className="textmedium marginbsixteen">Registered horse: <strong>{log.horse_name}</strong></h2>

                                    <ul>
                                        {/* ✅ Updated path to use log.horse_uuid */}
                                        <li className='marginbsixteen'>
                                            <Link to={`/horse-details/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                                View {log.horse_name}'s Details
                                            </Link>
                                        </li>
                                        <li className='marginbsixteen'>
                                            <Link to={`/calendar`} className="text-purple marginbsixteen">
                                                View Calendar
                                            </Link>
                                        </li>
                                    </ul>
                                    <hr className='marginbsixteen' />
                                    <ul>
                                        {/* ✅ Updated edit paths to use log.horse_uuid */}
                                        <li className='marginbsixteen'>
                                            <Link to={`/edit-horse/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                                Edit {log.horse_name}'s Details
                                            </Link>
                                        </li>
                                        <li className='marginbsixteen'>
                                            <Link to={`/privacy/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                                Edit Privacy Matrix
                                            </Link>
                                        </li>
                                    </ul>
                                </section>

                                <section className="section-container white-section-container purple-border no-print marginbsixteen">
                                    <h2 className="textmedium marginbsixteen">Horse box</h2>
                                    <ul>
                                        <li className='marginbsixteen'>
                                            <Link to={`/horsebox-view`} className="text-purple">View Horsebox Details</Link>
                                        </li>
                                    </ul>
                                </section>
                            </React.Fragment>
                        ))}
                    </>
                )}

                {myLogs.map(log => (
                    <div key={log.id}>
                        {/* ✅ Optional: If your QR code scanner generates profiles links, pass horse_uuid to it instead of id */}
                        <HorseQrCode horseId={log.horse_uuid} horseName={log.horse_name} />
                    </div>
                ))}

                <section className="section-container white-section-container no-print">
                    <h2 className="textmedium marginbeight">Add a New Horse</h2>
                    <form onSubmit={addHorse}>
                        <input
                            className="inputText marginbsixteen"
                            value={horseName}
                            onChange={e => setHorseName(e.target.value)}
                            placeholder="Enter horse name"
                            required
                        />
                        <br />
                        <button type="submit" className="buttonPurple buttonMain">
                            Add new horse to Stable
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}