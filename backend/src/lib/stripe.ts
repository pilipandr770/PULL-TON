import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Payments will not work.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia'
});

export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || '';

// Create checkout session for subscription
export const createCheckoutSession = async (
  customerId: string,
  successUrl: string,
  cancelUrl: string
) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: SUBSCRIPTION_PRICE_ID,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return session;
};

// Create customer
export const createCustomer = async (walletAddress: string) => {
  const customer = await stripe.customers.create({
    metadata: {
      walletAddress
    }
  });

  return customer;
};

// Create billing portal session
export const createPortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });

  return session;
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
};
