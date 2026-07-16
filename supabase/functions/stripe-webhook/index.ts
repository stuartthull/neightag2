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

type EmailContent = {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey: string;
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  idempotencyKey,
}: EmailContent): Promise<void> => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
  const fromEmail = Deno.env.get('ORDER_NOTIFICATION_FROM_EMAIL') || '';

  if (!resendApiKey || !fromEmail) {
    throw new Error(
      'Email is not configured: missing RESEND_API_KEY or ORDER_NOTIFICATION_FROM_EMAIL',
    );
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${responseBody}`);
  }
};

const sendOrderNotification = async (
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> => {
  const notificationEmail = Deno.env.get('ORDER_NOTIFICATION_EMAIL') || 'info@neightag.com';

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

  await sendEmail({
    to: notificationEmail,
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
    idempotencyKey: `${eventId}-order-notification`,
  });
};

const getCustomerEmail = (session: Stripe.Checkout.Session): string => {
  const email = session.customer_details?.email || session.customer_email;

  if (!email) {
    throw new Error(`Checkout Session ${session.id} does not contain a customer email address`);
  }

  return email;
};

const sendTapTagConfirmation = async (
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> => {
  const customerEmail = getCustomerEmail(session);
  const customerName = session.shipping_details?.name || session.customer_details?.name || 'there';
  const amount = formatAmount(session.amount_total, session.currency);
  const deliveryAddress = formatAddress(
    session.shipping_details?.address || session.customer_details?.address,
  );

  await sendEmail({
    to: customerEmail,
    subject: 'Your NeighTag TapTag order is confirmed',
    text: [
      `Hi ${customerName},`,
      '',
      'Thank you for your TapTag order. Your payment has been received and your order is being prepared.',
      `Order total: ${amount}`,
      `Delivery address: ${deliveryAddress}`,
      '',
      'We will contact you if we need any more information.',
      '',
      'NeighTag',
    ].join('\n'),
    html: `
      <h1>Your TapTag order is confirmed</h1>
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>Thank you for your TapTag order. Your payment has been received and your order is being prepared.</p>
      <p><strong>Order total:</strong> ${escapeHtml(amount)}</p>
      <p><strong>Delivery address:</strong> ${escapeHtml(deliveryAddress)}</p>
      <p>We will contact you if we need any more information.</p>
      <p>NeighTag</p>
    `,
    idempotencyKey: `${eventId}-taptag-confirmation`,
  });
};

const sendSubscriptionConfirmation = async (
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> => {
  const customerEmail = getCustomerEmail(session);
  const customerName = session.customer_details?.name || 'there';
  const amount = formatAmount(session.amount_total, session.currency);

  await sendEmail({
    to: customerEmail,
    subject: 'Your NeighTag subscription is active',
    text: [
      `Hi ${customerName},`,
      '',
      'Thank you for subscribing to NeighTag. Your subscription has been placed successfully.',
      `Amount paid today: ${amount}`,
      '',
      'You can view your horse profiles and manage your subscription from your NeighTag dashboard.',
      '',
      'NeighTag',
    ].join('\n'),
    html: `
      <h1>Your NeighTag subscription is active</h1>
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>Thank you for subscribing to NeighTag. Your subscription has been placed successfully.</p>
      <p><strong>Amount paid today:</strong> ${escapeHtml(amount)}</p>
      <p>You can view your horse profiles and manage your subscription from your NeighTag dashboard.</p>
      <p>NeighTag</p>
    `,
    idempotencyKey: `${eventId}-subscription-confirmation`,
  });
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
        await sendTapTagConfirmation(session, event.id);
        console.log(`Sent TapTag order notification for Checkout Session: ${session.id}`);
      } else if (
        session.mode === 'subscription' &&
        (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
      ) {
        await sendSubscriptionConfirmation(session, event.id);
        console.log(`Sent subscription confirmation for Checkout Session: ${session.id}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error';
    console.error(`Webhook Error: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }
});