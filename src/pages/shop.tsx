import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import TapTag from '../assets/taptag.jpg';
import StableTag from '../assets/stable-tap-card.jpg';
import { supabase } from '../supabaseClient';
import '../css/shop.css';
import CreditCards from '../assets/credit-cards.jpg';

interface CheckoutResponse {
    url?: string;
}

type ProductId = 'taptag' | 'laminated-stable-tag';

export default function Shop(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const [loadingProduct, setLoadingProduct] = useState<ProductId | null>(null);
    const [error, setError] = useState<string | null>(null);
    const paymentStatus = searchParams.get('payment');

    const handleCheckout = async (productId: ProductId): Promise<void> => {
        setLoadingProduct(productId);
        setError(null);

        const { data, error: checkoutError } = await supabase.functions.invoke<CheckoutResponse>(
            'create-product-checkout',
            { body: { productId } }
        );

        if (checkoutError) {
            setError(checkoutError.message || 'Unable to open Stripe Checkout.');
            setLoadingProduct(null);
            return;
        }

        if (!data?.url) {
            setError('Stripe did not return a checkout link. Please try again.');
            setLoadingProduct(null);
            return;
        }

        window.location.assign(data.url);
    };

    return (
        <main className="page-wrapper">
            <Helmet>
                <title>Shop NeighTag Products | NeighTag</title>
                <meta
                    name="description"
                    content="Buy NeighTag TapTags and laminated stable tags for quick access to your horse's details."
                />
                <meta property="og:title" content="Shop NeighTag Products | NeighTag" />
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
                    {error && (
                        <p className="shop-error" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="shop-product section-container white-section-container">
                        <img src={TapTag} alt="NeighTag TapTag" className="shop-product-image" />

                        <div className="shop-product-details">
                            <h2 className="textbig">
                                TapTag <b>£2.95</b>
                            </h2>
                            <p className="text-normal marginbsixteen">
                                <b>Please note:</b>
                                <br />
                                NeighTag subscription required.
                            </p>
                            <p className="text-normal marginbsixteen">
                                Keep your horse&apos;s important emergency and contact details close
                                at hand. Attach your TapTag to your saddle, reins or other
                                equipment, then tap it with a compatible phone for instant access.
                            </p>

                            <ul className="shop-benefits">
                                <li className="text-normal">Quick tap-to-view access</li>
                                <li className="text-normal">No camera or QR scanning required</li>
                                <li className="text-normal">Secure payment through Stripe</li>
                                <li className="text-normal">NeighTag subscription required</li>
                            </ul>

                            <button
                                type="button"
                                className="buttonMain buttonOrange shop-buy-button"
                                onClick={() => handleCheckout('taptag')}
                                disabled={loadingProduct !== null}
                            >
                                {loadingProduct === 'taptag'
                                    ? 'Opening secure checkout...'
                                    : 'Buy TapTag - £2.95'}
                            </button>

                            <p className="text-small shop-checkout-note">Secure Stripe Checkout.</p>
                            <div>
                                <img
                                    src={CreditCards}
                                    alt="Accepted credit cards"
                                    className="shop-credit-cards"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="shop-product section-container white-section-container">
                        <img
                            src={StableTag}
                            alt="Laminated NeighTag stable tag attached to a stable door"
                            className="shop-product-image"
                        />

                        <div className="shop-product-details">
                            <h2 className="textbig">
                                Personalised Stable Tag <b>£4.95</b>
                            </h2>
                            <p className="text-normal marginbsixteen">
                                <b>Please note:</b>
                                <br />
                                NeighTag subscription required.
                            </p>
                            <p className="text-normal marginbsixteen">
                                A ready-to-display laminated stable tag with a Tapable area and QR
                                code linking to your horse&apos;s up-to-date NeighTag details.
                            </p>

                            <ul className="shop-benefits">
                                <li className="text-normal">Durable laminated finish</li>
                                <li className="text-normal">Quick TapTag and QR code access</li>
                                <li className="text-normal">Secure payment through Stripe</li>
                                <li className="text-normal">NeighTag subscription required</li>
                            </ul>

                            <button
                                type="button"
                                className="buttonMain buttonOrange shop-buy-button"
                                onClick={() => handleCheckout('laminated-stable-tag')}
                                disabled={loadingProduct !== null}
                            >
                                {loadingProduct === 'laminated-stable-tag'
                                    ? 'Opening secure checkout...'
                                    : 'Buy Laminated Stable Tag - £4.95'}
                            </button>

                            <p className="text-small shop-checkout-note">Secure Stripe Checkout.</p>
                            <div>
                                <img
                                    src={CreditCards}
                                    alt="Accepted credit cards"
                                    className="shop-credit-cards"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
