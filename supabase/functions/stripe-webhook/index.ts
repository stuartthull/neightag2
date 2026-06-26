import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Initialize Supabase with Service Role Key to bypass Row Level Security (RLS) policies during updates
const supabaseUrl = Deno.env.get('LIVE_DB_URL') || Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
const supabaseServiceKey = Deno.env.get('LIVE_DB_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Change the variable name here to match what your function code expects below:
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe signature', { status: 400 });
  }

  try {
    const body = await req.text();
    // 🔑 Verify that the request actually came from Stripe
    // 🔑 Change constructEvent to await stripe.webhooks.constructEventAsync
    const event = await stripe.webhooks.constructEventAsync(
      body, 
      signature, 
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined, // 4th param: tolerance
      cryptoProvider // 5th param: Deno's Web Crypto adapter
    );

    // Handle successful subscription events
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      // Pull the metadata we attached back in Step A
      const { user_uuid, horse_uuid } = subscription.metadata;

      if (user_uuid && horse_uuid) {
        const subscriptionData = {
          user_uuid: user_uuid,
          horse_uuid: horse_uuid,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price?.id,
          status: subscription.status,
          
          // 🔑 REPLACE CURRENT_PERIOD_END WITH THIS ROBUST PARSER:
          current_period_end: subscription.current_period_end && !isNaN(Number(subscription.current_period_end))
            ? new Date(Number(subscription.current_period_end) * 1000).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // fallback to 1 year from now if empty/malformed
            
          updated_at: new Date().toISOString(),
        };

        // Upsert into your equi_subscriptions table
        const { error } = await supabaseAdmin
          .from('equi_subscriptions')
          .upsert(subscriptionData, { onConflict: 'horse_uuid' });

        if (error) throw error;
        console.log(`Successfully updated subscription status for horse: ${horse_uuid}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});