import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: object, status: number) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
            throw new Error('Server configuration error: missing billing configuration');
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

        const { customerId } = await req.json();
        if (!customerId) {
            throw new Error('Missing required customerId configuration');
        }

        const { data: subscription, error: subscriptionError } = await supabaseAdmin
            .from('equi_subscriptions')
            .select('id')
            .eq('user_uuid', user.id)
            .eq('stripe_customer_id', customerId)
            .limit(1)
            .maybeSingle();

        if (subscriptionError) throw subscriptionError;
        if (!subscription) {
            return jsonResponse({ error: 'Billing profile not found for this account' }, 403);
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });
        const requestOrigin = req.headers.get('origin') || '';
        const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin);
        const siteUrl = (
            isLocalOrigin ? requestOrigin : Deno.env.get('SITE_URL') || 'https://www.neightag.com'
        ).replace(/\/+$/, '');
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${siteUrl}/dashboard`,
        });

        return jsonResponse({ url: session.url }, 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown billing portal error';
        return jsonResponse({ error: message }, 400);
    }
});
