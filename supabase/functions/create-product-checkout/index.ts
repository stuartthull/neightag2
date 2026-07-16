import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const defaultPriceId = 'price_1TtTXbIfQpTOfYRJfPWeluKL'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 },
    )
  }

  try {
    const stripeSecretKey =
      Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_LIVE_SECRET_KEY') || ''

    if (!stripeSecretKey) {
      throw new Error('Server configuration error: missing STRIPE_SECRET_KEY')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
    const siteUrl = (Deno.env.get('SITE_URL') || 'https://www.neightag.com').replace(/\/+$/, '')
    const priceId = Deno.env.get('STRIPE_PRODUCT_PRICE_ID') || defaultPriceId

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      phone_number_collection: { enabled: true },
      metadata: {
        order_type: 'taptag',
        price_id: priceId,
      },
      payment_intent_data: {
        metadata: {
          order_type: 'taptag',
          price_id: priceId,
        },
      },
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE'],
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/shop?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop?payment=cancelled`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create checkout session'

    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
