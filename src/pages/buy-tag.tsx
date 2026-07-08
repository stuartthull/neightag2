import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // 👈 Make sure this relative path correctly points to your file location!
import { LocalPrice } from '../components/local-price';

export default function BuyTag(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const horseId = searchParams.get('id') || '';
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 🔑 Track the dynamically logged-in user account ID
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch the active user session automatically as soon as this component loads
    useEffect(() => {
        const fetchSessionUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };

        fetchSessionUser();
    }, []);

    const handleCheckout = async () => {
        if (!horseId) {
            setError("Missing horse configuration parameter.");
            return;
        }

        // Safety gate if a non-logged-in visitor accidentally hits this button
        if (!userId) {
            setError("You must be logged in to activate a live tag subscription.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = 'https://vjyvikuyuzkmyrtcuznc.supabase.co/functions/v1/create-checkout-session';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Both variables now safely leverage your verified live anon production key string
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeXZpa3V5dXprbXlydGN1em5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjY5MDksImV4cCI6MjA5NTkwMjkwOX0.CVg4HbusPRVlrSoMtF5VKc268jLHf8WGUYp6lyJ4deA',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeXZpa3V5dXprbXlydGN1em5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjY5MDksImV4cCI6MjA5NTkwMjkwOX0.CVg4HbusPRVlrSoMtF5VKc268jLHf8WGUYp6lyJ4deA'
                },
                body: JSON.stringify({
                    horse_uuid: horseId,
                    user_uuid: userId // Passes the verified live logged-in user UUID to Stripe
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to create a checkout session.');
            }

            // Redirect the browser window straight to Stripe's checkout portal page
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Stripe endpoint did not return a valid routing URL.");
            }

        } catch (err: any) {
            console.error("Payment routing error:", err);
            setError(err.message || "Something went wrong initializing checkout.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="section-container white-section-container activate-tag-section">
                <h2 className="textmedium">Activate Live Tag Protection</h2>
                <p className='text-normal marginbsixteen'>Secure instant emergency medical tracking access profile for your horse.</p>
                <p className='text-normal marginbsixteen'>We use Stripe to securely process your payment.</p>

                <div>
                    <code className='marginbsixteen' style={{ display: 'block', marginTop: '4px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>
                        Horse ID: {horseId || "No horse selected"}
                    </code>
                </div>
                <p className='text-normal marginbsixteen'>Your yearly subscription of <LocalPrice basePriceGbp={11} /> will be billed automatically.</p>


                {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>❌ {error}</p>}

                <button
                    onClick={handleCheckout}
                    disabled={loading || !horseId}
                    style={{ width: '100%', padding: '14px', background: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.2s', marginTop: '24px' }}
                >
                    {loading ? 'Opening Secure Portal...' : 'Activate Subscription'}
                </button>
            </div>
        </div>
    );
}