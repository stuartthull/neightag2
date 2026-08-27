import React from 'react';
import ShopProductPage from './shop-product-page';
import { SHOP_PRODUCTS } from './shop-products';

export default function TravelTapTag(): React.JSX.Element {
    return <ShopProductPage product={SHOP_PRODUCTS['travel-taptag']} />;
}