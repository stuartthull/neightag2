import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../../css/shop.css';
import { SHOP_PRODUCTS } from './shop-products';

export default function Shop(): React.JSX.Element {
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
