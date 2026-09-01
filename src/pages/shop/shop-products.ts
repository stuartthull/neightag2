import TapTagImage from '../../assets/taptag.jpg';
import TravelTapTagImage from '../../assets/travel-taptag.jpg';
import StableTagImage from '../../assets/stable-tap-card.jpg';
import HighGlossStableTagImage from '../../assets/high-gloss-stable-tag.jpg';
import SmallStableTagImage from '../../assets/small-taptag.jpg';

export type ProductId =
    | 'taptag'
    | 'travel-taptag'
    | 'laminated-stable-tag'
    | 'high-gloss-stable-tag'
    | 'small-stable-tag';

export interface ShopProduct {
    id: ProductId;
    slug: string;
    name: string;
    price: string;
    image: string;
    imageAlt: string;
    description: string;
    benefits: string[];
    checkoutLabel: string;
}

export const SHOP_PRODUCTS: Record<ProductId, ShopProduct> = {
    taptag: {
        id: 'taptag',
        slug: 'taptag',
        name: 'Saddle or Bridle/Collar TapTag',
        price: '£2.95',
        image: TapTagImage,
        imageAlt: 'NeighTag TapTag',
        description:
            "Keep your horse's important emergency and contact details close at hand. Attach your TapTag to your saddle, reins or other equipment, then tap it with a compatible phone for instant access.",
        benefits: [
            'Quick tap-to-view access',
            'No camera or QR scanning required',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'Do let us know if your stable door is metalllic, then we can provide this product to ensure it works correctly',
        ],
        checkoutLabel: 'Buy TapTag - £2.95',
    },
    'travel-taptag': {
        id: 'travel-taptag',
        slug: 'travel-taptag',
        name: 'Personalised Travel TapTag',
        price: '£8.95',
        image: TravelTapTagImage,
        imageAlt: 'Personalised NeighTag Travel TapTag',
        description:
            "Keep your horse's important emergency and contact details close at hand while travelling. Attach your personalised Travel TapTag to your horse's travel equipment, then tap it with a compatible phone for instant access.",
        benefits: [
            'Personalised travel-ready design',
            'Quick tap-to-view access',
            'No camera or QR scanning required',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'FREE Saddle TapTag included with this product',
            'Do let us know if your stable door is metalllic, then we can provide this product to ensure it works correctly',
        ],
        checkoutLabel: 'Buy Personalised Travel TapTag - £8.95',
    },
    'laminated-stable-tag': {
        id: 'laminated-stable-tag',
        slug: 'laminated-stable-tag',
        name: 'Personalised Stable Tag',
        price: '£4.95',
        image: StableTagImage,
        imageAlt: 'Laminated NeighTag stable tag attached to a stable door',
        description:
            "A ready-to-display laminated stable tag with a Tapable area and QR code linking to your horse's up-to-date NeighTag details.",
        benefits: [
            'Durable laminated finish',
            'Quick TapTag and QR code access',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'Do let us know if your stable door is metalllic, then we can provide this product to ensure it works correctly',
        ],
        checkoutLabel: 'Buy Laminated Stable Tag - £4.95',
    },
    'high-gloss-stable-tag': {
        id: 'high-gloss-stable-tag',
        slug: 'high-gloss-stable-tag',
        name: 'Personalised High Gloss Stable Tag',
        price: '£6.95',
        image: HighGlossStableTagImage,
        imageAlt: 'High Gloss NeighTag stable tag attached to a stable door',
        description:
            "A high gloss, water proof, UV protected stable tag with a Tapable area and QR code linking to your horse's up-to-date NeighTag details.",
        benefits: [
            'Free square Saddle TapTag',
            'Durable Resin finish',
            'Quick TapTag and QR code access',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'FREE Saddle TapTag included with this product',
            'Do let us know if your stable door is metalllic, then we can provide this product to ensure it works correctly',
        ],
        checkoutLabel: 'Buy High Gloss Stable Tag - £6.95',
    },
    'small-stable-tag': {
        id: 'small-stable-tag',
        slug: 'small-stable-tag',
        name: 'Personalised Small Stable Tag',
        price: '£3.95',
        image: SmallStableTagImage,
        imageAlt: 'Small NeighTag stable tag attached to a stable door',
        description:
            "A small stable tag with a Tapable area and phone number linking to your horse's up-to-date NeighTag details.",
        benefits: [
            'Durable Resin finish',
            'Quick TapTag and phone number access',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'FREE Saddle TapTag included with this product',
            'Do let us know if your stable door is metalllic, then we can provide this product to ensure it works correctly',
        ],
        checkoutLabel: 'Buy Small Stable Tag - £3.95',
    },
};
