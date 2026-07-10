import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // 💳 Added useLocation
import { supabase } from '../supabaseClient';

type LogRecord = {
    id: number;
    user_uuid: string;
    horse_uuid: string;
    horse_name: string;
};

type SubscriptionMap = {
    [horseUuid: string]: boolean;
};

export default function Dashboard() {
    const [myLogs, setMyLogs] = useState<LogRecord[]>([]);
    const [horseName, setHorseName] = useState('');
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeSubscriptions, setActiveSubscriptions] = useState<SubscriptionMap>({});

    // 💳 Track if we are actively waiting for Stripe's webhook to finish updating
    const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSessionUserId(data.session?.user?.id ?? null);
        });
    }, []);

    // 💳 Extracted logic into a helper that returns whether an active subscription was found
    const fetchMyLogsAndSubscriptions = async (userId: string): Promise<boolean> => {
        // 1. Fetch horse logs
        const { data: logData, error: logError } = await supabase
            .from('equi_log_main')
            .select('id, user_uuid, horse_uuid, horse_name')
            .eq('user_uuid', userId);

        if (logError) {
            console.error('Error fetching segmented records:', logError.message);
            return false;
        }

        const logs = (logData as LogRecord[]) || [];
        setMyLogs(logs);

        // 2. Fetch subscription status
        if (logs.length > 0) {
            const { data: subData, error: subError } = await supabase
                .from('equi_subscriptions')
                .select('horse_uuid, status')
                .eq('user_uuid', userId)
                .eq('status', 'active');

            if (subError) {
                console.error('Error fetching subscriptions:', subError.message);
            } else if (subData && subData.length > 0) {
                const subMap: SubscriptionMap = {};
                subData.forEach((sub) => {
                    if (sub.horse_uuid) {
                        subMap[sub.horse_uuid] = true;
                    }
                });
                setActiveSubscriptions(subMap);
                return true; // Found active subscription(s)
            }
        }

        // If we got here, no active subscriptions were found
        setActiveSubscriptions({});
        return false;
    };

    // Main data coordinator effect
    useEffect(() => {
        if (!sessionUserId) return;

        const queryParams = new URLSearchParams(location.search);
        const isPaymentSuccess = queryParams.get('payment') === 'success';

        const initializeDashboard = async () => {
            setLoading(true);
            const hasSub = await fetchMyLogsAndSubscriptions(sessionUserId);

            // 💳 If the URL says success, but our DB says otherwise, start polling!
            if (isPaymentSuccess && !hasSub) {
                setIsVerifyingPayment(true);

                let attempts = 0;
                const maxAttempts = 5; // Poll 5 times
                const intervalTime = 2000; // Every 2 seconds

                const intervalId = setInterval(async () => {
                    attempts += 1;
                    console.log(`Polling DB for webhook update... Attempt ${attempts}`);

                    const updatedHasSub = await fetchMyLogsAndSubscriptions(sessionUserId);

                    if (updatedHasSub || attempts >= maxAttempts) {
                        clearInterval(intervalId);
                        setIsVerifyingPayment(false);
                        setLoading(false);
                    }
                }, intervalTime);

                return () => clearInterval(intervalId);
            } else {
                setLoading(false);
            }
        };

        initializeDashboard();
    }, [sessionUserId, location.search]);

    // 🗓️ Compute globally if the user has any active subscriptions
    const hasAnyActiveSubscription = Object.values(activeSubscriptions).some(
        (isActive) => isActive === true
    );

    // 🐴 Check if the user is locked out from adding more horses
    const isHorseLimitReached = myLogs.length >= 1 && !hasAnyActiveSubscription;
    const isMaxHorsesReached = myLogs.length >= 2;
    // 🏷️ Get the ID of the first horse to link it directly to the purchase system
    const baseHorseId = myLogs[0]?.horse_uuid ?? '';

    const addHorse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!horseName || !sessionUserId) return;

        if (isHorseLimitReached) {
            alert('Stable limit reached. Please upgrade your subscription to add more horses.');
            return;
        }

        const { error = null } = await supabase.from('equi_log_main').insert([
            {
                horse_name: horseName,
                user_uuid: sessionUserId,
            },
        ]);

        if (error) {
            alert(error.message);
        } else {
            setHorseName('');
            setLoading(true);
            await fetchMyLogsAndSubscriptions(sessionUserId);
            setLoading(false);
        }
    };

    const handleDeleteHorseComplete = async (horseUuid: string, userId: string) => {
        const confirmDelete = window.confirm(
            'Are you sure? This will permanently wipe this horse, its entire calendar, and all its associated records. These can not be recovered.'
        );
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('equi_log_main')
            .delete()
            .eq('horse_uuid', horseUuid)
            .eq('user_uuid', userId);

        if (error) {
            alert(`Deletion failed: ${error.message}`);
        } else {
            alert('Horse and all associated records have been completely purged.');
            window.location.reload();
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container no-print">
                    <h1 className="textbig">Your Stable</h1>
                    <p className="text-normal marginbsixteen">
                        Manage your horses and their medical records.
                    </p>

                    {myLogs.map((log) => {
                        return (
                            <div key={`manage-${log.id}`}>
                                <button
                                    type="button"
                                    className="buttonSmall marginbsixteen buttonfullwidth"
                                    style={{
                                        backgroundColor: '#ff0000',
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                    }}
                                    onClick={() =>
                                        handleDeleteHorseComplete(log.horse_uuid, sessionUserId)
                                    }
                                >
                                    Delete {log.horse_name} and all associated records
                                </button>
                            </div>
                        );
                    })}

                    {/* 💳 Show a reassuring status indicator while polling */}
                    {isVerifyingPayment && (
                        <p
                            className="text-normal"
                            style={{
                                background: '#fef08a',
                                color: '#854d0e',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                marginTop: '10px',
                            }}
                        >
                            🔄 Confirming your payment details with Stripe... The page will unlock
                            automatically in a moment.
                        </p>
                    )}

                    {!hasAnyActiveSubscription && !isVerifyingPayment && (
                        <p className="text-normal">
                            🔒 Some features are locked until you activate a subscription for at
                            least one horse.
                        </p>
                    )}
                </section>

                {loading && !isVerifyingPayment ? (
                    <section className="section-container white-section-container no-print marginbsixteen">
                        <p className="text-normal">Loading your stable profile...</p>
                    </section>
                ) : myLogs.length === 0 ? (
                    <section className="section-container white-section-container no-print marginbsixteen">
                        <p
                            className="text-normal"
                            style={{ color: '#64748b', marginBottom: '20px' }}
                        >
                            No horses registered under this account yet.
                        </p>

                        <section className="section-container white-section-container no-print">
                            <h2 className="textmedium marginbeight">Add your First Horse</h2>
                            <form onSubmit={addHorse}>
                                <input
                                    className="inputText marginbsixteen"
                                    value={horseName}
                                    onChange={(e) => setHorseName(e.target.value)}
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
                        <>
                            {/* 2. HORSE MANAGEMENT ROSTER */}
                            {myLogs.map((log) => {
                                const isSubbed = !!activeSubscriptions[log.horse_uuid];
                                return (
                                    <section
                                        className="section-container white-section-container no-print marginbsixteen"
                                        key={`manage-${log.id}`}
                                    >
                                        <div className="marginbsixteen">
                                            <h2 className="textmedium" style={{ margin: 0 }}>
                                                Registered horse: <strong>{log.horse_name}</strong>
                                            </h2>
                                        </div>
                                        <ul className="olnone">
                                            <li className="marginbtwenfour">
                                                <Link
                                                    to={`/owner-horse-details/${log.horse_uuid}`}
                                                    className="buttonMain buttonPurple marginbsixteen"
                                                >
                                                    👁️ &nbsp;View full details
                                                </Link>
                                            </li>
                                        </ul>
                                        <hr className="marginbtwenfour" />
                                        <ul className="olnone">
                                            <li className="marginbtwenfour">
                                                <Link
                                                    to={`/edit-horse/${log.horse_uuid}`}
                                                    className="buttonSmall buttonWhite  marginbsixteen"
                                                >
                                                    ✏️&nbsp;&nbsp;Edit details
                                                </Link>
                                            </li>
                                            <li className="marginbtwenfour">
                                                <Link
                                                    to={
                                                        isSubbed
                                                            ? `/privacy/${log.horse_uuid}`
                                                            : `/activate-tag?id=${log.horse_uuid}`
                                                    }
                                                    className="buttonSmall buttonWhite purple marginbsixteen"
                                                >
                                                    {!isSubbed ? '🔒 ' : '🛡️ '} &nbsp;Edit privacy
                                                    matrix
                                                </Link>
                                            </li>
                                        </ul>
                                    </section>
                                );
                            })}

                            {/* 1. PRINTING UTILITIES BLOCK */}
                            <section className="section-container white-section-container no-print marginbsixteen">
                                <div className="marginbsixteen">
                                    <h2 className="textmedium" style={{ margin: 0 }}>
                                        Print your tags
                                    </h2>
                                </div>
                                {myLogs.map((log) => {
                                    const isSubbed = !!activeSubscriptions[log.horse_uuid];
                                    return (
                                        <ul key={`print-${log.id}`} className="olnone">
                                            <li className="marginbsixteen">
                                                <div className="marginbtwenfour">
                                                    <a
                                                        href={
                                                            isSubbed
                                                                ? `/print-stable-tag?id=${log.horse_uuid}&name=${encodeURIComponent(log.horse_name)}`
                                                                : '/print-stable-tag-dummy'
                                                        }
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                        className="buttonSmall buttonOrange"
                                                    >
                                                        🖨️ &nbsp;Print Stable Tag
                                                        {!isSubbed && ' preview'}
                                                    </a>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="marginbtwenfour">
                                                    <a
                                                        href={
                                                            isSubbed
                                                                ? `/print-horsebox-poster?id=${log.horse_uuid}&name=${encodeURIComponent(log.horse_name)}`
                                                                : '/print-horsebox-poster-dummy'
                                                        }
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                        className="buttonSmall buttonOrange"
                                                    >
                                                        🖨️ &nbsp;Print Horsebox Poster
                                                        {!isSubbed && ' preview'}
                                                    </a>
                                                </div>
                                            </li>
                                        </ul>
                                    );
                                })}
                            </section>
                        </>

                        {/* 3. USER ASSETS PANEL */}
                        <section className="section-container white-section-container no-print marginbsixteen">
                            <h2 className="textmedium marginbtwenfour">Global Tools & Assets</h2>
                            <ul className="olnone">
                                <li className="marginbtwenfour">
                                    <Link
                                        to={
                                            hasAnyActiveSubscription
                                                ? `/calendar`
                                                : `/activate-tag?id=${baseHorseId}`
                                        }
                                        className="buttonSmall buttonWhite"
                                    >
                                        {!hasAnyActiveSubscription ? '🔒 ' : '📅 '} View your stable
                                        calendar
                                    </Link>
                                </li>
                                <li className="marginbtwenfour">
                                    <Link
                                        to={
                                            hasAnyActiveSubscription
                                                ? `/horsebox-view`
                                                : `/activate-tag?id=${baseHorseId}`
                                        }
                                        className="buttonSmall buttonWhite"
                                    >
                                        {!hasAnyActiveSubscription ? '🔒 ' : '🚛 '}View your
                                        horsebox details
                                    </Link>
                                </li>
                                <li className="marginbtwenfour">
                                    <Link to="/add-bookmark" className="btext-purple text-small">
                                        Add a bookmark to your phones home screen.
                                    </Link>
                                </li>
                            </ul>
                        </section>

                        {/* ➕ CONDITIONAL ADD NEW HORSE UTILITY */}
                        {isMaxHorsesReached ? (
                            // 1. Hide the input completely when 2 or more horses exist
                            <section className="section-container white-section-container no-print">
                                <h2 className="textmedium marginbeight">🐴 Stable Limit Reached</h2>
                                <p className="text-normal" style={{ color: '#64748b', margin: 0 }}>
                                    You have reached the maximum allowance of 2 horse profiles.
                                    Delete an existing horse if you wish to add a new one.
                                </p>
                            </section>
                        ) : isHorseLimitReached ? (
                            // 2. Fall back to your subscription gate if they have 1 horse and no subscription
                            <section className="section-container white-section-container no-print">
                                <h2 className="textmedium marginbeight">🔒 Add a New Horse</h2>
                                <p
                                    className="text-normal"
                                    style={{ color: '#64748b', marginBottom: '12px' }}
                                >
                                    Free accounts are limited to one horse profile. Purchase a plan
                                    for your current horse to unlock additional slots.
                                </p>
                                <a
                                    href={`/activate-tag?id=${baseHorseId}`}
                                    className="buttonOrange buttonMain"
                                    style={{
                                        textDecoration: 'none',
                                        display: 'inline-block',
                                        textAlign: 'center',
                                    }}
                                >
                                    Add a subscription
                                </a>
                            </section>
                        ) : (
                            // 3. Show the interactive input field if they have 0 or 1 active horse matching requirements
                            <section className="section-container white-section-container no-print">
                                <h2 className="textmedium marginbeight">Add a New Horse</h2>
                                <form onSubmit={addHorse}>
                                    <input
                                        className="inputText marginbsixteen"
                                        value={horseName}
                                        onChange={(e) => setHorseName(e.target.value)}
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
