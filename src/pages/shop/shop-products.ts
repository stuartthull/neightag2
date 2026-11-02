import TapTagImage from '../../assets/taptag.jpg';
import TravelTapTagImage from '../../assets/travel-taptag.jpg';
import StableTagImage from '../../assets/hi-viz-strap.jpg';
import HighGlossStableTagImage from '../../assets/high-gloss-stable-tag.jpg';
import SmallStableTagImage from '../../assets/small-taptag.jpg';
import PersonalisedHorseboxPosterImage from '../../assets/personalised-horsebox-poster.jpg';

export type ProductId =
    | 'taptag'
    | 'travel-taptag'
    | 'laminated-stable-tag'
    | 'high-gloss-stable-tag'
    | 'small-stable-tag'
    | 'personalised-horsebox-poster';

export interface ShopProduct {
    id: ProductId;
    slug: string;
    name: string;
    price: string;
    image: string;
    imageAlt: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
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
        metaTitle: 'Saddle or Bridle TapTag | NeighTag Shop',
        metaDescription:
            "Buy a NeighTag TapTag for your horse's saddle, bridle or collar and keep emergency details close at hand.",
        benefits: [
            'Quick tap-to-view access',
            'No camera or QR scanning required',
            'Secure payment through Stripe',
            'NeighTag subscription required',
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
        metaTitle: 'Personalised Travel TapTag | NeighTag Shop',
        metaDescription:
            "Buy a personalised NeighTag Travel TapTag for quick access to your horse's details while travelling.",
        benefits: [
            'Durable Aluminium finish',
            'Personalised travel-ready design',
            'Quick tap-to-view access',
            'No camera or QR scanning required',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'FREE Saddle TapTag included with this product',
            'Size: 150mm x 200mm',
        ],
        checkoutLabel: 'Buy Personalised Travel TapTag - £8.95',
    },
    'high-gloss-stable-tag': {
        id: 'high-gloss-stable-tag',
        slug: 'high-gloss-stable-tag',
        name: 'Personalised High Gloss Stable TapTag',
        price: '£6.95',
        image: HighGlossStableTagImage,
        imageAlt: 'High Gloss NeighTag stable tag attached to a stable door',
        description:
            "A high gloss aluminium, water proof, UV protected stable tag with a Tapable area and QR code linking to your horse's up-to-date NeighTag details.",
        metaTitle: 'Personalised High Gloss Stable Tag | NeighTag Shop',
        metaDescription:
            "Buy a personalised high gloss NeighTag stable tag with QR code and tap access to your horse's details.",
        benefits: [
            'Durable Aluminium finish',
            'Personalised high gloss design',
            'Quick tap-to-view access',
            'No camera or QR scanning required',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'FREE Saddle TapTag included with this product',
            'Size: 150mm x 150mm',
        ],
        checkoutLabel: 'Buy High Gloss Stable TapTag - £6.95',
    },
    'small-stable-tag': {
        id: 'small-stable-tag',
        slug: 'small-stable-tag',
        name: 'Personalised Small Feed and Routines Tag',
        price: '£2.95',
        image: SmallStableTagImage,
        imageAlt: 'Small NeighTag stable tag for your tack room',
        description:
            "A small tack room tag linking to your horse's up-to-date NeighTag feeds and routines.",
        metaTitle: 'Small Feed and Routines Tag | NeighTag Shop',
        metaDescription:
            "Buy a personalised NeighTag feed and routines tag for quick access to your horse's stable information.",
        benefits: [
            'Durable Aluminium finish',
            'QR code linking to your horse\'s up-to-date NeighTag feeds and routines',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'Size: 150mm x 50mm',
        ],
        checkoutLabel: 'Buy Small Feed and Routines Tag - £2.95',
    },
    'personalised-horsebox-poster': {
        id: 'personalised-horsebox-poster',
        slug: 'personalised-horsebox-poster',
        name: 'Personalised Horse Box Poster A4',
        price: '£5.95',
        image: PersonalisedHorseboxPosterImage,
        imageAlt: 'Personalised A4 NeighTag horse box poster',
        description:
            "A personalised A4 horse box poster displaying your horse's important NeighTag details.",
        metaTitle: 'Personalised Horse Box Poster | NeighTag Shop',
        metaDescription:
            "Buy a personalised A4 NeighTag horse box poster displaying your horse's important details.",
        benefits: [
            'Personalised A4 poster',
            'Durable laminated finish',
            'Clear horse information for display in your horse box',
            'Secure payment through Stripe',
            'Size: 210mm x 297mm',
            'NeighTag subscription required',
        ],
        checkoutLabel: 'Buy Personalised Horse Box Poster A4 - £5.95',
    },
     'laminated-stable-tag': {
        id: 'laminated-stable-tag',
         slug: 'high-viz-wrist-straps',
        name: 'Hi-Viz Wrist Strap QR Code',
        price: '£4.95',
        image: StableTagImage,
        imageAlt: 'HiViz wrist strap with QR code',
        description:
            "A Hi-Viz wrist strap with a QR Code for when you're out hacking or eventing. Safety first.",
        metaTitle: 'Hi-Viz Wrist Straps | NeighTag Shop',
        metaDescription:
            "Buy Hi-Viz NeighTag wrist straps with a QR code for quick access to your horse's details when hacking or eventing.",
        benefits: [
            'Durable Hi-Viz material',
            'Quick scan QR code access',
            'Secure payment through Stripe',
            'NeighTag subscription required',
            'Size: Adjustable to fit wrist',
        ],
        checkoutLabel: 'Buy Hi-Viz Wrist Strap QR Code - £4.95',
    },
};
