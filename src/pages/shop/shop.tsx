import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../../css/shop.css';
import { SHOP_PRODUCTS } from './shop-products';

export default function Shop(): React.JSX.Element {
    const productsByPrice = Object.values(SHOP_PRODUCTS).sort(
        (firstProduct, secondProduct) =>
            Number(firstProduct.price.replace('£', '')) -
            Number(secondProduct.price.replace('£', ''))
    );

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
                    <p className="text-normal marginbsixteen">
                        <b>Quick update: </b> We’re taking a brief break until September 9th! ☀️ Orders placed while we’re away will take just a little longer to reach you. Thank you so much for your patience and support!
                    </p>
                    <p className="text-normal marginbsixteen">
                        <b>100% FREE REPLACEMENTS: </b>Lost, broken, damaged or simply misplaced one of your NeighTag products? No problem! We will replace them for free. Please contact us for more information.
                    </p>
                    <p className="text-normal marginbsixteen">
                        NeighTag products are designed to be used in conjunction with a NeighTag subscription. Please ensure you have an active subscription before purchasing.
                    </p>
                    <div className="shop-products-grid">
                        {productsByPrice.map((product) => (
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
                                    <h2 className="textmedium shop-product-heading">
                                        {product.name}
                                    </h2>
                                    <p className="text-normal marginbsixteen">
                                        Please note: NeighTag subscription required.
                                    </p>
                                    <p className="shop-product-price">{product.price}</p>
                                    <a href={`/shop/${product.slug}`} className="shop-details-link">
                                        View full product details
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
