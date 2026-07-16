import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // 💳 Added useLocation
import { supabase, supabaseAnonKey } from '../supabaseClient';
import { LocalPrice } from '../components/local-price';
import { formatGBDate } from '../utils/date-format';

type LogRecord = {
    id: number;
    user_uuid: string;
    horse_uuid: string;
    horse_name: string;
};

type SubscriptionMap = {
    [horseUuid: string]: boolean;
};

type SubscriptionDetails = {
    status: string;
    current_period_end: string | null;
};

type SubscriptionDetailsMap = {
    [horseUuid: string]: SubscriptionDetails;
};

export default function Dashboard() {
    const [myLogs, setMyLogs] = useState<LogRecord[]>([]);
    const [horseName, setHorseName] = useState('');
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeSubscriptions, setActiveSubscriptions] = useState<SubscriptionMap>({});
    const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetailsMap>({});
    const [pendingDeleteHorseUuid, setPendingDeleteHorseUuid] = useState<string | null>(null);
    const [deletingHorseUuid, setDeletingHorseUuid] = useState<string | null>(null);

    // 💳 Dynamic Customer ID state for Stripe Portal integration
    const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);

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

        // 2. Fetch subscription status along with Stripe Customer ID
        if (logs.length > 0) {
            const { data: subData, error: subError } = await supabase
                .from('equi_subscriptions')
                .select('horse_uuid, status, current_period_end, stripe_customer_id')
                .eq('user_uuid', userId);

            if (subError) {
                console.error('Error fetching subscriptions:', subError.message);
            } else if (subData && subData.length > 0) {
                // Save the dynamic Customer identity row cleanly to state context
                if (subData[0].stripe_customer_id) {
                    setStripeCustomerId(subData[0].stripe_customer_id);
                }

                const subMap: SubscriptionMap = {};
                const detailsMap: SubscriptionDetailsMap = {};
                subData.forEach((sub) => {
                    if (sub.horse_uuid) {
                        detailsMap[sub.horse_uuid] = {
                            status: sub.status,
                            current_period_end: sub.current_period_end,
                        };

                        if (sub.status === 'active') {
                            subMap[sub.horse_uuid] = true;
                        }
                    }
                });
                setActiveSubscriptions(subMap);
                setSubscriptionDetails(detailsMap);
                return Object.keys(subMap).length > 0;
            }
        }

        // If we got here, no active subscriptions were found
        setActiveSubscriptions({});
        setSubscriptionDetails({});
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

    const handleManageBilling = async () => {
        if (!stripeCustomerId) {
            alert("We couldn't find an active subscription profile link for your account yet.");
            return;
        }

        try {
            const isLocalhost =
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const functionUrl = isLocalhost
                ? 'http://127.0.0.1:54321/functions/v1/create-portal-session'
                : 'https://vjyvikuyuzkmyrtcuznc.supabase.co/functions/v1/create-portal-session';

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: supabaseAnonKey,
                    ...(session?.access_token
                        ? { Authorization: `Bearer ${session.access_token}` }
                        : {}),
                },
                body: JSON.stringify({ customerId: stripeCustomerId }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.error) {
                throw new Error(data.error || `Portal request failed (${response.status})`);
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Could not load billing gateway settings. Please try again later.');
            }
        } catch (err) {
            console.error('Portal error connection failure:', err);
            alert(
                err instanceof Error
                    ? err.message
                    : 'Error trying to connect securely to billing portal parameters.'
            );
        }
    };

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
        setDeletingHorseUuid(horseUuid);

        const { error } = await supabase
            .from('equi_log_main')
            .delete()
            .eq('horse_uuid', horseUuid)
            .eq('user_uuid', userId);

        setDeletingHorseUuid(null);

        if (error) {
            alert(`Deletion failed: ${error.message}`);
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container no-print">
                    <h1 className="textbig nomargin">Your Stable</h1>

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
                        <div>
                            <p className="text-normal marginbsixteen">
                                🔒 Some features are locked until you activate a subscription for at
                                least one horse.
                            </p>
                            <div>
                                {baseHorseId ? (
                                    <Link
                                        to={`/activate-tag?id=${baseHorseId}`}
                                        className="buttonOrange buttonMain"
                                    >
                                        Subscribe for <LocalPrice basePriceGbp={11} /> a year
                                    </Link>
                                ) : (
                                    <p className="text-normal">
                                        Please add your first horse below to continue.
                                    </p>
                                )}
                            </div>
                        </div>
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
                                const protection = subscriptionDetails[log.horse_uuid];
                                return (
                                    <section
                                        className="section-container white-section-container no-print marginbsixteen"
                                        key={`manage-${log.id}`}
                                    >
                                        <div className="dashboard-horse-split">
                                            <div className="dashboard-horse-split-column">
                                                <div className="marginbsixteen">
                                                    <h2 className="textbig" style={{ margin: 0 }}>
                                                        Registered horse:
                                                        <br />
                                                        <strong>{log.horse_name}</strong>
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="dashboard-horse-split-column marginbsixteen">
                                                <div className="section-container lightorange-section-container">
                                                    <h2 className="textmedium marginbeight">
                                                        🛡️ Live Tag Subscription
                                                    </h2>
                                                    <div
                                                        className="text-normal marginbeight datarow"
                                                        style={{ maxWidth: '400px' }}
                                                    >
                                                        <span>Tag Link Status:</span>{' '}
                                                        <strong
                                                            style={{
                                                                color:
                                                                    protection?.status === 'active'
                                                                        ? '#16a34a'
                                                                        : '#dc2626',
                                                            }}
                                                        >
                                                            {protection?.status?.toUpperCase() ||
                                                                'INACTIVE'}
                                                        </strong>
                                                    </div>
                                                    <div
                                                        className="text-normal datarow"
                                                        style={{ maxWidth: '400px' }}
                                                    >
                                                        <span>Renewal Date:</span>{' '}
                                                        <strong>
                                                            {protection?.current_period_end
                                                                ? formatGBDate(
                                                                      protection.current_period_end
                                                                  )
                                                                : 'Not Documented'}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="olnone">
                                            <li className="marginbsixteen">
                                                <Link
                                                    to={`/owner-horse-details/${log.horse_uuid}`}
                                                    className="buttonMain buttonPurple marginbsixteen"
                                                >
                                                    👁️ &nbsp;View full horse details
                                                </Link>
                                            </li>
                                            <li className="marginbtwenfour">
                                                <Link
                                                    to={
                                                        isSubbed
                                                            ? `/horse-details/${log.horse_uuid}`
                                                            : `/activate-tag?id=${log.horse_uuid}`
                                                    }
                                                    className="buttonMain buttonPurple marginbsixteen"
                                                >
                                                    {!isSubbed ? '🔒 ' : '🐴 '} &nbsp;See your
                                                    public profile
                                                </Link>
                                            </li>
                                        </ul>
                                        <ul className="olnone">
                                            <li className="marginbtwenfour">
                                                <Link
                                                    to={`/edit-horse/${log.horse_uuid}`}
                                                    className="buttonLink marginbsixteen"
                                                >
                                                    Edit horse details&nbsp;&nbsp;✏️
                                                </Link>
                                            </li>
                                            <li className="marginbtwenfour">
                                                <Link
                                                    to={
                                                        isSubbed
                                                            ? `/privacy/${log.horse_uuid}`
                                                            : `/activate-tag?id=${log.horse_uuid}`
                                                    }
                                                    className="buttonLink marginbsixteen"
                                                >
                                                    Edit what the public see&nbsp;&nbsp;
                                                    {!isSubbed ? '🔒 ' : '✏️️ '}
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
                                        🖨️ Print your tags
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
                                                        className="buttonLink"
                                                    >
                                                        Print <b>{log.horse_name}</b> Stable Tag
                                                        {!isSubbed && ' preview'}
                                                        {!isSubbed && `🔒`}
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
                                                        className="buttonLink"
                                                    >
                                                        Print <b>{log.horse_name}</b> Poster
                                                        {!isSubbed && ' preview'}
                                                        {!isSubbed && '🔒'}
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
                            <h2 className="textmedium marginbtwenfour">
                                ⚙️ &nbsp;&nbsp;Global Tools & Assets
                            </h2>
                            <ul className="olnone">
                                <li className="marginbtwenfour">
                                    <Link
                                        to={
                                            hasAnyActiveSubscription
                                                ? `/calendar`
                                                : `/activate-tag?id=${baseHorseId}`
                                        }
                                        className="buttonLink"
                                    >
                                        View your stable calendar&nbsp;&nbsp;
                                        {!hasAnyActiveSubscription && '🔒'}
                                    </Link>
                                </li>
                                <li className="marginbtwenfour">
                                    <Link
                                        to={
                                            hasAnyActiveSubscription
                                                ? `/horsebox-view`
                                                : `/activate-tag?id=${baseHorseId}`
                                        }
                                        className="buttonLink"
                                    >
                                        View your horsebox details&nbsp;&nbsp;
                                        {!hasAnyActiveSubscription && '🔒'}
                                    </Link>
                                </li>
                                {stripeCustomerId && (
                                    <li className="marginbtwenfour">
                                        <button
                                            type="button"
                                            onClick={handleManageBilling}
                                            className="buttonLink buttonWhite"
                                        >
                                            Manage Billing & Cancellations
                                        </button>
                                    </li>
                                )}
                                <li className="marginbtwenfour">
                                    <Link to="/add-bookmark" className="buttonLink">
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
                                    Free accounts are limited to one horse profile. Subscribe to
                                    unlock additional slots.
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
                                    Subscribe for <LocalPrice basePriceGbp={11} /> a year
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
                        {myLogs.length === 0 ? null : (
                            <section className="section-container white-section-container no-print">
                                <h2 className="textmedium marginbeight">
                                    Delete your horse and all associated records
                                </h2>
                                <p className="text-normal marginbsixteen">
                                    ! Be careful, once you delete the records they are not
                                    recoverable.
                                </p>
                                {myLogs.map((log) => {
                                    const isConfirmingDelete =
                                        pendingDeleteHorseUuid === log.horse_uuid;
                                    const isDeleting = deletingHorseUuid === log.horse_uuid;

                                    return (
                                        <div
                                            key={`manage-${log.id}`}
                                            className="dashboard-delete-horse"
                                        >
                                            {isConfirmingDelete ? (
                                                <div
                                                    className="dashboard-delete-confirmation"
                                                    role="alert"
                                                >
                                                    <p className="text-normal">
                                                        <strong>Are you sure?</strong> This will
                                                        permanently wipe {log.horse_name}, its
                                                        entire calendar, and all its associated
                                                        records. These cannot be recovered.
                                                    </p>
                                                    <div className="dashboard-delete-actions">
                                                        <button
                                                            type="button"
                                                            className="buttonSmall"
                                                            onClick={() =>
                                                                setPendingDeleteHorseUuid(null)
                                                            }
                                                            disabled={isDeleting}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="buttonSmall dashboard-delete-confirm-button"
                                                            onClick={() =>
                                                                handleDeleteHorseComplete(
                                                                    log.horse_uuid,
                                                                    sessionUserId
                                                                )
                                                            }
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting
                                                                ? 'Deleting...'
                                                                : `Permanently delete ${log.horse_name}`}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="buttonSmall marginbsixteen buttonfullwidth"
                                                    style={{
                                                        backgroundColor: '#ff0000',
                                                        color: '#ffffff',
                                                        fontWeight: 'bold',
                                                    }}
                                                    onClick={() =>
                                                        setPendingDeleteHorseUuid(log.horse_uuid)
                                                    }
                                                >
                                                    Delete {log.horse_name}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
