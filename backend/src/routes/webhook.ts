import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { stripe } from '../lib/stripe';
import { prisma } from '../lib/prisma';
import Stripe from 'stripe';

const router = Router();

// Stripe webhook handler
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('🔔 Webhook received!');
    
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('📝 Signature present:', !!sig);
    console.log('📝 Webhook secret configured:', !!webhookSecret);
    console.log('📝 Body type:', typeof req.body);
    console.log('📝 Body is Buffer:', Buffer.isBuffer(req.body));

    if (!webhookSecret) {
      console.error('❌ Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log('✅ Webhook signature verified successfully');
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📩 Stripe webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutComplete(session);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCanceled(subscription);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Payment succeeded for invoice ${invoice.id}`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).send('Webhook handler error');
    }
  }
);

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log(`🛒 Checkout complete:`);
  console.log(`   Customer ID: ${customerId}`);
  console.log(`   Subscription ID: ${subscriptionId}`);

  // Find subscription by stripeCustomerId
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  });

  console.log(`   Found subscription in DB: ${!!existingSubscription}`);

  if (existingSubscription) {
    // Update subscription in database
    const updated = await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      }
    });
    console.log(`   ✅ Subscription updated: ${updated.id}, status: ${updated.status}`);
  } else {
    console.log(`   ⚠️ No subscription found for customer ${customerId}`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const status = mapStripeStatus(subscription.status);
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  console.log(`📋 Subscription update:`);
  console.log(`   Customer ID: ${customerId}`);
  console.log(`   Subscription ID: ${subscription.id}`);
  console.log(`   Stripe Status: ${subscription.status} -> Mapped: ${status}`);
  console.log(`   Period: ${currentPeriodStart.toISOString()} - ${currentPeriodEnd.toISOString()}`);

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (existingSubscription) {
    const updated = await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        stripeSubscriptionId: subscription.id,
        status,
        currentPeriodStart,
        currentPeriodEnd
      }
    });
    console.log(`   ✅ Updated subscription ${updated.id}`);
  } else {
    console.log(`   ⚠️ No subscription found for customer ${customerId}`);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      status: 'CANCELED'
    }
  });

  console.log(`Subscription canceled for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      status: 'PAST_DUE'
    }
  });

  console.log(`Payment failed for customer ${customerId}`);
}

function mapStripeStatus(stripeStatus: string): 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INACTIVE' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'ACTIVE';
    case 'canceled':
      return 'CANCELED';
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE';
    default:
      return 'INACTIVE';
  }
}

export default router;
