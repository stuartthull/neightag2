import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface WithSubscriptionProps { }

interface HOCOptions {
    requireAuthentication?: boolean;
}

export default function withSubscriptionProtection<T extends WithSubscriptionProps>(
    WrappedComponent: React.ComponentType<T>,
    options: HOCOptions = { requireAuthentication: false }
) {
    return function ProtectedComponent(props: T) {
        const [loading, setLoading] = useState<boolean>(true);
        const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
        const [hasSubscription, setHasSubscription] = useState<boolean>(false);

        const params = useParams();
        const [searchParams] = useSearchParams();

        const horseId = params.id || params.horseId || params.horse_uuid || searchParams.get('id');

        useEffect(() => {
            async function checkAccess() {
                try {
                    // 1. Check for a valid logged-in user session
                    const { data: { user } } = await supabase.auth.getUser();
                    setIsAuthenticated(!!user);

                    if (options.requireAuthentication && !user) {
                        setLoading(false);
                        return;
                    }

                    // 2. Query subscription status
                    let query = supabase.from('equi_subscriptions').select('status');

                    if (horseId) {
                        // Page has a specific horse context (e.g. Horse Details)
                        query = query.eq('horse_uuid', horseId).eq('status', 'active');
                    } else if (user) {
                        // User-level view without horse context (e.g. HorseboxView)
                        // Checks if this user has *any* active horse subscriptions
                        query = query.eq('user_uuid', user.id).eq('status', 'active');
                    } else {
                        // No horse context and no logged-in user
                        setHasSubscription(false);
                        setLoading(false);
                        return;
                    }

                    const { data, error } = await query.limit(1).maybeSingle();

                    if (error) {
                        console.error("Subscription query error:", error.message);
                        setHasSubscription(false);
                    } else {
                        setHasSubscription(!!data);
                    }

                } catch (error) {
                    console.error("Access verification error:", error);
                    setHasSubscription(false);
                } finally {
                    setLoading(false);
                }
            }

            checkAccess();
        }, [horseId]);

        // 1. Loading State
        if (loading) {
            return (
                <div style={containerStyle}>
                    <p style={{ color: '#64748b', fontFamily: 'sans-serif' }}>Verifying access authorization...</p>
                </div>
            );
        }

        // 2. Strict Authentication Wall
        if (options.requireAuthentication && !isAuthenticated) {
            return (
                <div style={containerStyle}>
                    <div style={cardStyle}>
                        <h2 className="textmedium">🔒 Authentication Required</h2>
                        <p className="text-normal marginbsixteen">Please log in to your account to view this secure panel.</p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="buttonMain buttonPurple"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            );
        }

        // 3. Subscription Paywall Case
        if (!hasSubscription) {
            if (isAuthenticated) {
                return (
                    <div style={containerStyle}>
                        <div style={cardStyle}>
                            <h2 className="textmedium">⭐ Premium Feature Locked</h2>
                            <p className="text-normal marginbsixteen">
                                {horseId
                                    ? "This section requires an active Live Tag Protection subscription for this horse."
                                    : "This section requires at least one active horse subscription on your account."}
                            </p>
                            <button
                                onClick={() => window.location.href = horseId ? `/buy-tag?id=${horseId}` : '/dashboard'}
                                className="buttonMain buttonPurple"
                            >
                                {horseId ? "Activate Subscription" : "Go to Dashboard"}
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div style={containerStyle}>
                    <div style={cardStyle}>
                        <h2 className="textmedium">🚫 Profile Unavailable</h2>
                        <p className="text-normal marginbsixteen">The emergency tracking profile for this view is not active.</p>
                    </div>
                </div>
            );
        }

        // 4. Access Granted
        return <WrappedComponent {...props} />;
    };
}

const containerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px', fontFamily: 'sans-serif' };
const cardStyle: React.CSSProperties = { maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', backgroundColor: '#ffffff' };