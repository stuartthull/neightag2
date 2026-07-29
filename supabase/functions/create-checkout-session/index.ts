import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: object, status: number) =>
    new Response(JSON.stringify(body), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
    });

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
        const stripeSecretKey =
            Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_LIVE_SECRET_KEY') || '';
        const supabaseUrl =
            Deno.env.get('LIVE_DB_URL') || Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
        const supabaseServiceKey =
            Deno.env.get('LIVE_DB_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!stripeSecretKey || !supabaseServiceKey) {
            throw new Error('Server configuration error: missing payment configuration');
        }

        const accessToken = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
        if (!accessToken) {
            return jsonResponse({ error: 'Authentication required' }, 401);
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const {
            data: { user },
            error: userError,
        } = await supabaseAdmin.auth.getUser(accessToken);

        if (userError || !user) {
            return jsonResponse({ error: 'Invalid or expired session' }, 401);
        }

        const { horse_uuid } = await req.json();
        if (!horse_uuid) {
            throw new Error('Missing horse_uuid parameter');
        }

        const { data: horse, error: horseError } = await supabaseAdmin
            .from('equi_log_main')
            .select('horse_uuid')
            .eq('horse_uuid', horse_uuid)
            .eq('user_uuid', user.id)
            .maybeSingle();

        if (horseError) throw horseError;
        if (!horse) {
            return jsonResponse({ error: 'Horse not found for this account' }, 403);
        }

        const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
            .from('equi_subscriptions')
            .select('stripe_customer_id')
            .eq('user_uuid', user.id)
            .not('stripe_customer_id', 'is', null)
            .order('created_at', { ascending: true })
            .limit(1);

        if (subscriptionError) throw subscriptionError;

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });
        const siteUrl = (Deno.env.get('SITE_URL') || 'https://www.neightag.com').replace(
            /\/+$/,
            ''
        );
        const customerId = subscriptions?.[0]?.stripe_customer_id;
        const metadata = { user_uuid: user.id, horse_uuid };
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            allow_promotion_codes: true,
            ...(customerId ? { customer: customerId } : { customer_email: user.email }),
            line_items: [
                {
                    price: Deno.env.get('STRIPE_LIVE_PRICE_ID') || 'price_1Tp523IfQpTOfYRJksw6dZRZ',
                    quantity: 1,
                },
            ],
            metadata,
            subscription_data: { metadata },
            success_url: `${siteUrl}/dashboard?payment=success`,
            cancel_url: `${siteUrl}/dashboard?payment=cancelled`,
        });

        return jsonResponse({ url: session.url }, 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown checkout error';
        return jsonResponse({ error: message }, 400);
    }
});
