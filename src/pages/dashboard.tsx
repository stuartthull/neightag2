import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import HorseQrCode from '../components/qr-code';

type LogRecord = {
    id: number;
    user_uuid: string;
    horse_uuid: string;
    horse_name: string;
};

export default function Dashboard() {
    const [myLogs, setMyLogs] = useState<LogRecord[]>([]);
    const [horseName, setHorseName] = useState('');
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // 🔍 1. Track which horse profile is currently selected for printing
    const [activePrintId, setActivePrintId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSessionUserId(data.session?.user?.id ?? null);
        });
    }, []);

    const fetchMyLogs = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equi_log_main')
            .select('id, user_uuid, horse_uuid, horse_name')
            .eq('user_uuid', userId);

        if (error) {
            console.error("Error fetching segmented records:", error.message);
        } else {
            const logs = (data as LogRecord[]) || [];
            setMyLogs(logs);
            // Default to the first horse if available so there's always a backup target
            if (logs.length > 0) setActivePrintId(logs[0].horse_uuid);
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
            setHorseName('');
            await fetchMyLogs(sessionUserId);
        }
    };

    const handleDeleteHorseComplete = async (horseUuid: string, userId: string) => {
        const confirmDelete = window.confirm("Are you sure? This will permanently wipe this horse, its entire calendar, and all its associated records. These can not be recovered.");
        if (!confirmDelete) return;

        // ⚡ This single query triggers a chain reaction that clears everything
        const { error } = await supabase
            .from('equi_log_main')
            .delete()
            .eq('horse_uuid', horseUuid)
            .eq('user_uuid', userId); // 🔒 Security check

        if (error) {
            alert(`Deletion failed: ${error.message}`);
        } else {
            alert("Horse and all associated records have been completely purged.");
            window.location.reload();
        }
    };

    const triggerPrint = (horseUuid: string) => {
        setActivePrintId(horseUuid);
        // Small timeout allows React to apply the active print class before triggering the browser dialog
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container no-print">
                    <h1 className="textbig">Your Stable</h1>
                    <p className="text-normal">Manage your horses and their medical records.</p>
                </section>

                {loading ? (
                    <section className="section-container white-section-container no-print marginbsixteen">
                        <p className="text-normal">Loading your stable profile...</p>
                    </section>
                ) : myLogs.length === 0 ? (
                    <section className="section-container white-section-container no-print marginbsixteen">
                        <p className="text-normal" style={{ color: '#64748b', marginBottom: '20px' }}>
                            No horses registered under this account yet.
                        </p>
                    </section>
                ) : (
                    <>
                        {/* 🐴 HORSE MANAGEMENT ROSTER */}
                        {myLogs.map(log => (
                            <section key={log.id} className="section-container white-section-container no-print marginbsixteen">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="marginbsixteen">
                                    <h2 className="textmedium" style={{ margin: 0 }}>Registered horse: <strong>{log.horse_name}</strong></h2>

                                    {/* 🖨️ Action button to lock focus onto this specific horse asset */}
                                    <button
                                        onClick={() => triggerPrint(log.horse_uuid)}
                                        className="buttonPurple buttonSmall"
                                    >
                                        🖨️ Print QR Tag
                                    </button>
                                </div>
                                <ul>
                                    <li className='marginbsixteen'>
                                        <Link to={`/horse-details/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                            View {log.horse_name}'s details
                                        </Link>
                                    </li>
                                    <li className='marginbsixteen'>
                                        <Link to={`/calendar`} className="text-purple marginbsixteen">
                                            View your calendar
                                        </Link>
                                    </li>
                                </ul>
                                <hr className='marginbsixteen' />
                                <ul>
                                    <li className='marginbsixteen'>
                                        <Link to={`/edit-horse/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                            Edit {log.horse_name}'s details
                                        </Link>
                                    </li>
                                    <li className='marginbsixteen'>
                                        <Link to={`/privacy/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                            Edit {log.horse_name}'s privacy matrix
                                        </Link>
                                    </li>
                                </ul>

                                <button type="button" className="buttonOrange buttonSmall" onClick={() => handleDeleteHorseComplete(log.horse_uuid, sessionUserId)}>
                                    🚨&nbsp;Delete horse
                                </button>
                            </section>
                        ))}

                        {/* 🚛 HORSE BOX ASSET PANEL */}
                        <section className="section-container white-section-container no-print marginbsixteen">
                            <h2 className="textmedium marginbsixteen">Horse box</h2>
                            <ul>
                                <li className='marginbsixteen'>
                                    <Link to={`/horsebox-view`} className="text-purple">View your horsebox details</Link>
                                </li>
                            </ul>
                        </section>
                    </>
                )}

                {/* 🖨️ TARGETED QR PRINTER CONTAINER */}
                {myLogs.map(log => (
                    <div
                        key={`qr-${log.id}`}
                        className={`stable-qr-print-block ${log.horse_uuid === activePrintId ? 'print-target-active' : 'print-target-hidden'}`}
                    >
                        <HorseQrCode horseId={log.horse_uuid} horseName={log.horse_name} />
                    </div>
                ))}

                {/* ➕ ADD NEW HORSE UTILITY */}
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
