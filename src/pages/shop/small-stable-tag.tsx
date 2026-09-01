import React from 'react';
import ShopProductPage from './shop-product-page';
import { SHOP_PRODUCTS } from './shop-products';

export default function SmallStableTag(): React.JSX.Element {
    return <ShopProductPage product={SHOP_PRODUCTS['small-stable-tag']} />;
}
