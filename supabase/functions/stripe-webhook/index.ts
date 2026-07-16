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

const escapeHtml = (value: string | null | undefined): string =>
  (value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatAddress = (address: Stripe.Address | null | undefined): string => {
  if (!address) return 'Not provided';

  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean).join(', ');
};

const formatAmount = (amount: number | null, currency: string | null): string => {
  if (amount === null || !currency) return 'Not available';

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const sendOrderNotification = async (
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
  const notificationEmail = Deno.env.get('ORDER_NOTIFICATION_EMAIL') || 'info@neightag.com';
  const fromEmail = Deno.env.get('ORDER_NOTIFICATION_FROM_EMAIL') || '';

  if (!resendApiKey || !fromEmail) {
    throw new Error(
      'Order notification is not configured: missing RESEND_API_KEY or ORDER_NOTIFICATION_FROM_EMAIL',
    );
  }

  const customer = session.customer_details;
  const shipping = session.shipping_details;
  const customerName = shipping?.name || customer?.name || 'Not provided';
  const shippingAddress = formatAddress(shipping?.address || customer?.address);
  const amount = formatAmount(session.amount_total, session.currency);
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || 'Not available';

  const text = [
    'A new TapTag order has been paid.',
    '',
    `Amount: ${amount}`,
    `Customer: ${customerName}`,
    `Email: ${customer?.email || 'Not provided'}`,
    `Phone: ${customer?.phone || 'Not provided'}`,
    `Delivery address: ${shippingAddress}`,
    `Stripe Checkout Session: ${session.id}`,
    `Stripe Payment Intent: ${paymentIntentId}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': eventId,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [notificationEmail],
      subject: `New TapTag order - ${amount}`,
      text,
      html: `
        <h1>New TapTag order</h1>
        <p>A TapTag order has been paid and is ready to fulfil.</p>
        <table>
          <tbody>
            <tr><th align="left">Amount</th><td>${escapeHtml(amount)}</td></tr>
            <tr><th align="left">Customer</th><td>${escapeHtml(customerName)}</td></tr>
            <tr><th align="left">Email</th><td>${escapeHtml(customer?.email || 'Not provided')}</td></tr>
            <tr><th align="left">Phone</th><td>${escapeHtml(customer?.phone || 'Not provided')}</td></tr>
            <tr><th align="left">Delivery address</th><td>${escapeHtml(shippingAddress)}</td></tr>
            <tr><th align="left">Checkout Session</th><td>${escapeHtml(session.id)}</td></tr>
            <tr><th align="left">Payment Intent</th><td>${escapeHtml(paymentIntentId)}</td></tr>
          </tbody>
        </table>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Resend order notification failed (${response.status}): ${responseBody}`);
  }
};

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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.metadata?.order_type === 'taptag' && session.payment_status === 'paid') {
        await sendOrderNotification(session, event.id);
        console.log(`Sent TapTag order notification for Checkout Session: ${session.id}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});