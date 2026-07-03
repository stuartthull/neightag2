import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

type LogRecord = {
    id: number;
    user_uuid: string;
    horse_uuid: string;
    horse_name: string;
};

// 💳 Type to map active status per horse
type SubscriptionMap = {
    [horseUuid: string]: boolean;
};

export default function Dashboard() {
    const [myLogs, setMyLogs] = useState<LogRecord[]>([]);
    const [horseName, setHorseName] = useState('');
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // 💳 Dictionary of horse_uuid -> is_active
    const [activeSubscriptions, setActiveSubscriptions] = useState<SubscriptionMap>({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSessionUserId(data.session?.user?.id ?? null);
        });
    }, []);

    const fetchMyLogsAndSubscriptions = async (userId: string) => {
        setLoading(true);

        // 1. Fetch horse logs
        const { data: logData, error: logError } = await supabase
            .from('equi_log_main')
            .select('id, user_uuid, horse_uuid, horse_name')
            .eq('user_uuid', userId);

        if (logError) {
            console.error("Error fetching segmented records:", logError.message);
            setLoading(false);
            return;
        }

        const logs = (logData as LogRecord[]) || [];
        setMyLogs(logs);

        // 2. Fetch subscription status for all the user's horses in one go
        if (logs.length > 0) {
            const { data: subData, error: subError } = await supabase
                .from('equi_subscriptions')
                .select('horse_uuid, status')
                .eq('user_uuid', userId)
                .eq('status', 'active');

            if (subError) {
                console.error("Error fetching subscriptions:", subError.message);
            } else {
                // Transform array into a handy key-value map for quick O(1) lookups
                const subMap: SubscriptionMap = {};
                subData?.forEach(sub => {
                    if (sub.horse_uuid) {
                        subMap[sub.horse_uuid] = true;
                    }
                });
                setActiveSubscriptions(subMap);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        if (sessionUserId) {
            fetchMyLogsAndSubscriptions(sessionUserId);
        }
    }, [sessionUserId]);

    // 🗓️ Compute globally if the user has any active subscriptions
    const hasAnyActiveSubscription = Object.values(activeSubscriptions).some(isActive => isActive === true);

    // 🐴 Check if the user is locked out from adding more horses
    const isHorseLimitReached = myLogs.length >= 1 && !hasAnyActiveSubscription;

    // 🏷️ Get the ID of the first horse to link it directly to the purchase system
    const baseHorseId = myLogs[0]?.horse_uuid ?? '';

    const addHorse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!horseName || !sessionUserId) return;

        // Boundary safety check
        if (isHorseLimitReached) {
            alert("Stable limit reached. Please upgrade your subscription to add more horses.");
            return;
        }

        const { error = null } = await supabase.from('equi_log_main').insert([{
            horse_name: horseName,
            user_uuid: sessionUserId
        }]);

        if (error) {
            alert(error.message);
        } else {
            setHorseName('');
            await fetchMyLogsAndSubscriptions(sessionUserId);
        }
    };

    const handleDeleteHorseComplete = async (horseUuid: string, userId: string) => {
        const confirmDelete = window.confirm("Are you sure? This will permanently wipe this horse, its entire calendar, and all its associated records. These can not be recovered.");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('equi_log_main')
            .delete()
            .eq('horse_uuid', horseUuid)
            .eq('user_uuid', userId);

        if (error) {
            alert(`Deletion failed: ${error.message}`);
        } else {
            alert("Horse and all associated records have been completely purged.");
            window.location.reload();
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container no-print">
                    <h1 className="textbig">Your Stable</h1>
                    <p className="text-normal">Manage your horses and their medical records.</p>
                    {!hasAnyActiveSubscription && <p className="text-normal">🔒 Some features are locked until you activate a subscription for at least one horse.</p>}

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

                        <section className="section-container white-section-container no-print">
                            <h2 className="textmedium marginbeight">Add your First Horse</h2>
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
                    </section>
                ) : (
                    <>
                        {/* 1. PRINTING UTILITIES BLOCK */}
                        <section className="section-container white-section-container no-print">
                            {myLogs.map(log => {
                                const isSubbed = !!activeSubscriptions[log.horse_uuid];
                                return (
                                    <div key={`print-${log.id}`}>
                                        <div className="marginbsixteen">
                                            <a
                                                href={isSubbed ? `/print-stable-tag?id=${log.horse_uuid}&name=${encodeURIComponent(log.horse_name)}` : `/activate-tag?id=${log.horse_uuid}`}
                                                rel="noopener noreferrer"
                                                target={isSubbed ? "_blank" : "_self"}
                                                className="buttonOrange buttonSmall"
                                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                            >
                                                {!isSubbed ? '🔒 ' : '🖨️ '}Print {log.horse_name}'s Stable Tag
                                            </a>
                                        </div>
                                        <div className="marginbsixteen">
                                            <a
                                                href={isSubbed ? `/print-horsebox-poster?id=${log.horse_uuid}&name=${encodeURIComponent(log.horse_name)}` : `/activate-tag?id=${log.horse_uuid}`}
                                                rel="noopener noreferrer"
                                                target={isSubbed ? "_blank" : "_self"}
                                                className="buttonOrange buttonSmall"
                                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                            >
                                                {!isSubbed ? '🔒 ' : '🖨️ '}Print Horsebox Poster
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        {/* 2. HORSE MANAGEMENT ROSTER */}
                        {myLogs.map(log => {
                            const isSubbed = !!activeSubscriptions[log.horse_uuid];
                            return (
                                <section key={`manage-${log.id}`} className="section-container white-section-container no-print marginbsixteen">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }} className="marginbsixteen">
                                        <h2 className="textmedium" style={{ margin: 0 }}>Registered horse: <strong>{log.horse_name}</strong></h2>
                                    </div>
                                    <ul>
                                        <li className='marginbsixteen'>
                                            <Link to={`/owner-horse-details/${log.horse_uuid}`} className="text-purple marginbsixteen">
                                                View {log.horse_name}'s full details
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
                                            <Link to={isSubbed ? `/privacy/${log.horse_uuid}` : `/activate-tag?id=${log.horse_uuid}`} className="text-purple marginbsixteen">
                                                {!isSubbed && '🔒 '}Edit {log.horse_name}'s privacy matrix
                                            </Link>
                                        </li>
                                    </ul>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <button type="button" className="buttonSmall" style={{ backgroundColor: '#ff0000', color: '#ffffff', fontWeight: 'bold' }} onClick={() => handleDeleteHorseComplete(log.horse_uuid, sessionUserId)}>
                                            Delete horse
                                        </button>
                                    </div>
                                </section>
                            );
                        })}

                        {/* 3. USER ASSETS PANEL (Global modules grouped together) */}
                        <section className="section-container white-section-container no-print marginbsixteen">
                            <h2 className="textmedium marginbsixteen">Global Tools & Assets</h2>
                            <ul>
                                <li className='marginbsixteen'>
                                    <Link to={hasAnyActiveSubscription ? `/calendar` : `/activate-tag?id=${baseHorseId}`} className="text-purple">
                                        {!hasAnyActiveSubscription && '🔒 '}View your stable calendar
                                    </Link>
                                </li>
                                <li className='marginbsixteen'>
                                    <Link to={hasAnyActiveSubscription ? `/horsebox-view` : `/activate-tag?id=${baseHorseId}`} className="text-purple">
                                        {!hasAnyActiveSubscription && '🔒 '}View your horsebox details
                                    </Link>
                                </li>
                            </ul>

                        </section>

                        {/* ➕ CONDITIONAL ADD NEW HORSE UTILITY */}
                        {isHorseLimitReached ? (
                            <section className="section-container white-section-container no-print">
                                <h2 className="textmedium marginbeight">🔒 Add a New Horse</h2>
                                <p className="text-normal" style={{ color: '#64748b', marginBottom: '12px' }}>
                                    Free accounts are limited to one horse profile. Purchase a plan for your current horse to unlock additional slots.
                                </p>
                                <a href={`/activate-tag?id=${baseHorseId}`} className="buttonOrange buttonMain" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                                    Add a subscription
                                </a>
                            </section>
                        ) : (
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
}