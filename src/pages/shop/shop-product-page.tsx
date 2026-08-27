import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import CreditCards from '../../assets/credit-cards.jpg';
import { supabase } from '../../supabaseClient';
import '../../css/shop.css';
import { ShopProduct } from './shop-products';

interface CheckoutResponse {
    url?: string;
}

interface ShopProductPageProps {
    product: ShopProduct;
}

export default function ShopProductPage({ product }: ShopProductPageProps): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paymentStatus = searchParams.get('payment');

    const handleCheckout = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        const { data, error: checkoutError } = await supabase.functions.invoke<CheckoutResponse>(
            'create-product-checkout',
            { body: { productId: product.id } }
        );

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
                <title>{product.name} | NeighTag Shop</title>
                <meta
                    name="description"
                    content={`Buy a NeighTag ${product.name} for quick access to your horse's details.`}
                />
                <meta property="og:title" content={`${product.name} | NeighTag Shop`} />
            </Helmet>

            <div className="page-container">
                <a href="/shop" className="shop-back-link">
                    Back to shop
                </a>

                <section className="shop-product shop-product-page section-container white-section-container">
                    <img
                        src={product.image}
                        alt={product.imageAlt}
                        className="shop-product-image"
                    />

                    <div className="shop-product-details">
                        <p className="shop-eyebrow">NeighTag shop</p>
                        <h1 className="textbig">{product.name}</h1>

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

                        <p className="text-normal marginbsixteen">
                            <b>Please note:</b>
                            <br />
                            NeighTag subscription required.
                        </p>
                        <p className="text-normal marginbsixteen">{product.description}</p>

                        <ul className="shop-benefits">
                            {product.benefits.map((benefit) => (
                                <li className="text-normal" key={benefit}>
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <p className="shop-product-page-price">{product.price}</p>
                        <button
                            type="button"
                            className="buttonMain buttonOrange shop-buy-button"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? 'Opening secure checkout...' : product.checkoutLabel}
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
                </section>
            </div>
        </main>
    );
}
