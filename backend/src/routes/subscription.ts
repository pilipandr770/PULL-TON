import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { 
  stripe, 
  createCheckoutSession, 
  createCustomer, 
  createPortalSession,
  SUBSCRIPTION_PRICE_ID 
} from '../lib/stripe';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get subscription status
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id }
    });

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        hasAccess: false
      });
    }

    const hasAccess = 
      subscription.status === 'ACTIVE' && 
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());

    res.json({
      success: true,
      subscription: {
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      hasAccess
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session for new subscription
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!SUBSCRIPTION_PRICE_ID) {
      throw new AppError('Stripe not configured', 500);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { subscription: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if already has active subscription
    if (user.subscription?.status === 'ACTIVE') {
      throw new AppError('Already has active subscription', 400);
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await createCustomer(user.walletAddress);
      stripeCustomerId = customer.id;

      // Create or update subscription record
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customer.id
        },
        update: {
          stripeCustomerId: customer.id
        }
      });
    }

    // Create checkout session
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await createCheckoutSession(
      stripeCustomerId,
      `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${frontendUrl}/subscription/cancel`
    );

    res.json({
      success: true,
      checkoutUrl: session.url
    });
  } catch (error) {
    next(error);
  }
});

// Create billing portal session (for managing subscription)
router.post('/portal', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id }
    });

    if (!subscription?.stripeCustomerId) {
      throw new AppError('No subscription found', 404);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await createPortalSession(
      subscription.stripeCustomerId,
      `${frontendUrl}/dashboard`
    );

    res.json({
      success: true,
      portalUrl: session.url
    });
  } catch (error) {
    next(error);
  }
});

// Get pricing info
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    pricing: {
      price: 5,
      currency: 'EUR',
      interval: 'month',
      features: [
        'Full dashboard access',
        'Transaction history',
        'Real-time analytics',
        'Email notifications',
        'Priority support'
      ]
    }
  });
});

export default router;
