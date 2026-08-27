import Stripe from 'npm:stripe@13.10.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const defaultPriceId = 'price_1TtTXbIfQpTOfYRJfPWeluKL';
const defaultHighGlossStableTagPriceId = 'price_1U5NUDIfQpTOfYRJSHg2xpFE';
const defaultTravelTapTagPriceId = 'price_1U90y6IfQpTOfYRJn5yLqmbK';

type ProductId =
    | 'taptag'
    | 'travel-taptag'
    | 'laminated-stable-tag'
    | 'high-gloss-stable-tag';

type Product = {
    name: string;
    orderType: string;
    priceId: string;
};

const isProductId = (value: unknown): value is ProductId =>
    value === 'taptag' ||
    value === 'travel-taptag' ||
    value === 'laminated-stable-tag' ||
    value === 'high-gloss-stable-tag';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405,
        });
    }

    try {
        const stripeSecretKey =
            Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_LIVE_SECRET_KEY') || '';

        if (!stripeSecretKey) {
            throw new Error('Server configuration error: missing STRIPE_SECRET_KEY');
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        const siteUrl = (Deno.env.get('SITE_URL') || 'https://www.neightag.com').replace(
            /\/+$/,
            ''
        );

        const products: Record<ProductId, Product> = {
            taptag: {
                name: 'TapTag',
                orderType: 'taptag',
                priceId:
                    Deno.env.get('STRIPE_TAPTAG_PRICE_ID') ||
                    Deno.env.get('STRIPE_PRODUCT_PRICE_ID') ||
                    defaultPriceId,
            },
            'travel-taptag': {
                name: 'Personalised Travel TapTag',
                orderType: 'travel_taptag',
                priceId:
                    Deno.env.get('STRIPE_TRAVEL_TAPTAG_PRICE_ID') || defaultTravelTapTagPriceId,
            },
            'laminated-stable-tag': {
                name: 'Laminated Stable Tag',
                orderType: 'laminated_stable_tag',
                priceId: Deno.env.get('STRIPE_LAMINATED_STABLE_TAG_PRICE_ID') || '',
            },
            'high-gloss-stable-tag': {
                name: 'Personalised High Gloss Stable Tag + free TapTag',
                orderType: 'high_gloss_stable_tag',
                priceId:
                    Deno.env.get('STRIPE_HIGH_GLOSS_STABLE_TAG_PRICE_ID') ||
                    defaultHighGlossStableTagPriceId,
            },
        };

        const body = await req.json().catch(() => ({}));
        const productId = body.productId || 'taptag';

        if (!isProductId(productId)) {
            throw new Error(`Unknown product: ${String(productId)}`);
        }

        const product = products[productId];

        if (!product.priceId) {
            throw new Error(`Server configuration error: product ${productId} is unavailable`);
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            allow_promotion_codes: true,
            phone_number_collection: { enabled: true },
            metadata: {
                order_type: product.orderType,
                product_id: productId,
                product_name: product.name,
                price_id: product.priceId,
            },
            payment_intent_data: {
                metadata: {
                    order_type: product.orderType,
                    product_id: productId,
                    product_name: product.name,
                    price_id: product.priceId,
                },
            },
            shipping_address_collection: {
                allowed_countries: ['GB', 'IE'],
            },
            line_items: [
                {
                    price: product.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${siteUrl}/shop?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/shop?payment=cancelled`,
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Unable to create checkout session';

        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
