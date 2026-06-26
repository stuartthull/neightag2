import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function BuyTag(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const horseId = searchParams.get('id') || '';
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Mocking a user ID for testing purposes. 
    // Replace this with your actual logged-in auth user UUID (e.g., from Supabase auth state)
    const mockUserId = "u_live_user_998877";

    const handleCheckout = async () => {
        if (!horseId) {
            setError("Missing horse configuration parameter.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Point this to your local Docker edge function endpoint 
            // Or change to your live production Supabase URL when deployed!
            const endpoint = 'http://localhost:54321/functions/v1/create-checkout-session';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 🔑 BOTH of these are required by the local gateway router to allow CORS
                    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
                    'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
                },
                body: JSON.stringify({
                    horse_uuid: horseId,
                    user_uuid: mockUserId
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
        <div style={{ maxWidth: '450px', margin: '60px auto', padding: '24px', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 'bold' }}>Activate Live Tag Protection</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Secure instant emergency medical tracking access profile for your horse.</p>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', textAlign: 'left', color: '#334155' }}>
                <strong>Configuration Target:</strong>
                <code style={{ display: 'block', marginTop: '4px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>
                    Horse ID: {horseId || "No horse selected"}
                </code>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>❌ {error}</p>}

            <button
                onClick={handleCheckout}
                disabled={loading || !horseId}
                style={{ width: '100%', padding: '14px', background: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.2s' }}
            >
                {loading ? 'Opening Secure Portal...' : 'Activate Subscription'}
            </button>
        </div>
    );
}