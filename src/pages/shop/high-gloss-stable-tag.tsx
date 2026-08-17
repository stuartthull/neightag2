import React from 'react';
import ShopProductPage from './shop-product-page';
import { SHOP_PRODUCTS } from './shop-products';

export default function HighGlossStableTag(): React.JSX.Element {
    return <ShopProductPage product={SHOP_PRODUCTS['high-gloss-stable-tag']} />;
}
