import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocalPrice } from '../components/local-price';
import { supabase, supabaseAnonKey } from '../supabaseClient';

export default function BuyTag(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const horseId = searchParams.get('id') || '';
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };

        fetchSessionUser();
    }, []);

    const handleCheckout = async () => {
        if (!horseId) {
            setError('Missing horse configuration parameter.');
            return;
        }

        if (!userId) {
            setError('You must be logged in to activate a live tag subscription.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('Your session has expired. Please sign in again.');
            }

            const response = await fetch(
                'https://vjyvikuyuzkmyrtcuznc.supabase.co/functions/v1/create-checkout-session',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: supabaseAnonKey,
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ horse_uuid: horseId }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to create a checkout session.');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Stripe endpoint did not return a valid routing URL.');
            }
        } catch (err: unknown) {
            console.error('Payment routing error:', err);
            setError(
                err instanceof Error ? err.message : 'Something went wrong initializing checkout.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="section-container white-section-container activate-tag-section">
                <h2 className="textmedium">Activate your Subscription</h2>
                <p className="text-normal marginbsixteen">
                    We use Stripe to securely process your payment.
                </p>

                <div>
                    <code
                        className="marginbsixteen"
                        style={{
                            display: 'block',
                            marginTop: '4px',
                            background: '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                        }}
                    >
                        Horse ID: {horseId || 'No horse selected'}
                    </code>
                </div>
                <p className="text-normal marginbsixteen">
                    Your yearly subscription of <LocalPrice basePriceGbp={11} /> will be billed
                    automatically. You can cancel anytime. Your subscription will renew
                    automatically unless cancelled. If you cancel your subscription, you will retain
                    access until the end of the current billing period.
                </p>

                {error && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
                        ❌ {error}
                    </p>
                )}

                <button
                    onClick={handleCheckout}
                    disabled={loading || !horseId}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'background 0.2s',
                        marginTop: '24px',
                    }}
                >
                    {loading ? (
                        'Opening Secure Portal...'
                    ) : (
                        <>
                            Subscribe for <LocalPrice basePriceGbp={11} /> a year
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
