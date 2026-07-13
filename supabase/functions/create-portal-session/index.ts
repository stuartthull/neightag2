import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

// 🔑 ADD THIS BLOCK TO FIX THE 'corsHeaders' ERROR:
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Grab the origin dynamically to support localhost & live domains
  const origin = req.headers.get("origin") || "http://localhost:3000";
  
  // Set the allow origin variable dynamically matching our logic
  corsHeaders['Access-Control-Allow-Origin'] = origin;

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey =
      Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_LIVE_SECRET_KEY') || '';

    if (!stripeSecretKey) {
      throw new Error('Server configuration error: missing STRIPE_SECRET_KEY');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
    })

    const { customerId } = await req.json()
    if (!customerId) {
      throw new Error("Missing required customerId configuration")
    }

    // 4. Dynamic Redirect Link Generation using the incoming matching origin!
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`, // 👈 Automatically goes to local OR live dashboard!
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})