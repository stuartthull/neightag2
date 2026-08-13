import TapTagImage from '../../assets/taptag.jpg';
import StableTagImage from '../../assets/stable-tap-card.jpg';

export type ProductId = 'taptag' | 'laminated-stable-tag';

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
        name: 'TapTag',
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
        ],
        checkoutLabel: 'Buy TapTag - £2.95',
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
        ],
        checkoutLabel: 'Buy Laminated Stable Tag - £4.95',
    },
};
