import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import TapTag from '../assets/taptag.jpg';
import { supabase } from '../supabaseClient';
import '../css/shop.css';

interface CheckoutResponse {
    url?: string;
}

export default function Shop(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paymentStatus = searchParams.get('payment');

    const handleCheckout = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        const { data, error: checkoutError } =
            await supabase.functions.invoke<CheckoutResponse>('create-product-checkout');

        if (checkoutError) {
            setError(checkoutError.message || 'Unable to open Stripe Checkout.');
            setLoading(false);
            return;
        }

        if (!data?.url) {
            setError('Stripe did not return a checkout link. Please try again.');
            setLoading(false);
            return;
        }

        window.location.assign(data.url);
    };

    return (
        <main className="page-wrapper">
            <Helmet>
                <title>Shop TapTag | NeighTag</title>
                <meta
                    name="description"
                    content="Buy a NeighTag TapTag for quick access to your horse's emergency and contact details."
                />
                <meta property="og:title" content="Shop TapTag | NeighTag" />
            </Helmet>

            <div className="page-container">
                <section className="section-container white-section-container no-print">
                    <h1 className="textbig marginbsixteen">Shop NeighTag</h1>
                    {paymentStatus === 'success' && (
                        <p className="shop-status shop-status-success" role="status">
                            Thank you for your order. Your payment was successful.
                        </p>
                    )}
                    {paymentStatus === 'cancelled' && (
                        <p className="shop-status shop-status-cancelled" role="status">
                            Your checkout was cancelled and you have not been charged.
                        </p>
                    )}

                    <div className="shop-product section-container white-section-container">
                        <img src={TapTag} alt="NeighTag TapTag" className="shop-product-image" />

                        <div className="shop-product-details">
                            <h2 className="textbig">
                                TapTag <b>£2.95</b>
                            </h2>
                            <p className="text-normal marginbsixteen">
                                Keep your horse&apos;s important emergency and contact details close
                                at hand. Attach your TapTag to your saddle, reins or other
                                equipment, then tap it with a compatible phone for instant access.
                            </p>

                            <ul className="shop-benefits">
                                <li className="text-normal">Quick tap-to-view access</li>
                                <li className="text-normal">No camera or QR scanning required</li>
                                <li className="text-normal">Secure payment through Stripe</li>
                            </ul>

                            {error && (
                                <p className="shop-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="button"
                                className="buttonMain buttonOrange shop-buy-button"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Opening secure checkout...' : 'Buy TapTag - £2.95'}
                            </button>

                            <p className="text-small shop-checkout-note">Secure Stripe Checkout.</p>
                        </div>
                    </div>
                    <p className="text-normal">More coming soon.</p>
                </section>
            </div>
        </main>
    );
}
