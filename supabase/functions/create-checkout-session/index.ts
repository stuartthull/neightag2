console.log("!!! STRIPE FUNCTION IS WORKING !!!");
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

// 1. Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(), // Required for Deno environment
});

// CORS headers configuration to let your localhost frontend call this function safely
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse incoming body from frontend (contains user_uuid and horse_uuid)
    const { horse_uuid, user_uuid } = await req.json();

    if (!horse_uuid || !user_uuid) {
      throw new Error('Missing horse_uuid or user_uuid parameter');
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
    {
      // Make sure this value isn't undefined or pointing to a test-mode ID!
      price: Deno.env.get('STRIPE_LIVE_PRICE_ID') || 'price_1Tp523IfQpTOfYRJksw6dZRZ', 
      quantity: 1,
    },
  ],
      // 🔑 CRITICAL: Passing metadata so Stripe forwards it to your webhook handler
      metadata: { user_uuid, horse_uuid },
      subscription_data: {
        metadata: { user_uuid, horse_uuid }
      },
      // Redirect paths back to your application front-end
      success_url: `http://neightag.com/dashboard?payment=success`,
      cancel_url: `http://neightag.com/dashboard?payment=cancelled`,
    });

    // 4. Return the checkout session URL back to the frontend
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})