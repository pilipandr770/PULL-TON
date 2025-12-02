import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { adminMiddleware, AdminRequest } from '../middleware/auth';
import { getPoolState, formatTon } from '../lib/ton';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

// All routes require admin auth
router.use(adminMiddleware);

// Dashboard stats
router.get('/stats', async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      recentUsers,
      poolState
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { subscription: true }
      }),
      getPoolState()
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubscriptions * 5; // 5€ per subscription

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        mrr: `€${mrr}`,
        pool: {
          balance: poolState.balance,
          balanceTon: formatTon(poolState.balance),
          totalShares: poolState.totalShares,
          sharePrice: poolState.sharePrice
        },
        recentUsers: recentUsers.map(u => ({
          id: u.id,
          walletAddress: u.walletAddress,
          createdAt: u.createdAt,
          hasSubscription: u.subscription?.status === 'ACTIVE'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// List all users
router.get('/users', async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where = search ? {
      walletAddress: { contains: search }
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { subscription: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        walletAddress: u.walletAddress,
        createdAt: u.createdAt,
        cachedShares: u.cachedShares,
        cachedValue: u.cachedValue,
        subscription: u.subscription ? {
          status: u.subscription.status,
          currentPeriodEnd: u.subscription.currentPeriodEnd
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single user details
router.get('/users/:id', async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        subscription: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      user: {
        ...user,
        transactions: user.transactions.map(tx => ({
          ...tx,
          amountTon: formatTon(tx.amount)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// List all subscriptions
router.get('/subscriptions', async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { user: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.subscription.count({ where })
    ]);

    res.json({
      success: true,
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        user: {
          id: s.user.id,
          walletAddress: s.user.walletAddress
        }
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create new admin (super admin only)
router.post('/admins', async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (req.admin?.role !== 'SUPER_ADMIN') {
      throw new AppError('Super admin access required', 403);
    }

    const { email, password, role } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        role: role || 'MODERATOR'
      }
    });

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// List admins (super admin only)
router.get('/admins', async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (req.admin?.role !== 'SUPER_ADMIN') {
      throw new AppError('Super admin access required', 403);
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    res.json({
      success: true,
      admins
    });
  } catch (error) {
    next(error);
  }
});

export default router;
