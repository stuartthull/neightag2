import React from 'react';
import ShopProductPage from './shop-product-page';
import { SHOP_PRODUCTS } from './shop-products';

export default function PersonalisedHorseboxPoster(): React.JSX.Element {
    return <ShopProductPage product={SHOP_PRODUCTS['personalised-horsebox-poster']} />;
}
