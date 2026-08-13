import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import '../../css/shop.css';
import CreditCards from '../../assets/credit-cards.jpg';
import { ProductId, SHOP_PRODUCTS } from './shop-products';

interface CheckoutResponse {
    url?: string;
}

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

                    {Object.values(SHOP_PRODUCTS).map((product) => (
                        <div
                            className="shop-product section-container white-section-container"
                            key={product.id}
                        >
                            <a
                                href={`/shop/${product.slug}`}
                                className="shop-product-link"
                                aria-label={`View details for ${product.name}`}
                            >
                                <img
                                    src={product.image}
                                    alt={product.imageAlt}
                                    className="shop-product-image"
                                />
                            </a>

                            <div className="shop-product-details">
                                <h2 className="textbig">
                                    {product.name} - <b>{product.price}</b>
                                </h2>
                                <p className="text-normal marginbsixteen">
                                    <b>Please note:</b>
                                    <br />
                                    NeighTag subscription required.
                                </p>
                                <p className="text-normal marginbsixteen">{product.description}</p>

                                <a href={`/shop/${product.slug}`} className="shop-details-link">
                                    View full product details
                                </a>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
}
