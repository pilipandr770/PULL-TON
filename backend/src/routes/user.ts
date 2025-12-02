import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { getUserShares, getPoolState, formatTon } from '../lib/ton';
import { authMiddleware, AuthRequest, subscriptionMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        subscription: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get live shares from chain
    const shares = await getUserShares(user.walletAddress);
    const poolState = await getPoolState();

    // Calculate estimated value
    let estimatedValue = '0';
    if (BigInt(poolState.totalShares) > 0n) {
      estimatedValue = (
        (BigInt(poolState.balance) * BigInt(shares)) / BigInt(poolState.totalShares)
      ).toString();
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        shares: shares,
        estimatedValue: estimatedValue,
        estimatedValueTon: formatTon(estimatedValue),
        subscription: user.subscription ? {
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user transaction history (requires subscription)
router.get(
  '/transactions',
  authMiddleware,
  subscriptionMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId: req.user!.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.transaction.count({
          where: { userId: req.user!.id }
        })
      ]);

      res.json({
        success: true,
        transactions: transactions.map(tx => ({
          ...tx,
          amountTon: formatTon(tx.amount)
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
  }
);

// Get user dashboard data (requires subscription)
router.get(
  '/dashboard',
  authMiddleware,
  subscriptionMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get current shares
      const shares = await getUserShares(user.walletAddress);
      const poolState = await getPoolState();

      // Calculate current value
      let currentValue = '0';
      let poolPercentage = 0;
      if (BigInt(poolState.totalShares) > 0n) {
        currentValue = (
          (BigInt(poolState.balance) * BigInt(shares)) / BigInt(poolState.totalShares)
        ).toString();
        poolPercentage = Number(BigInt(shares) * 10000n / BigInt(poolState.totalShares)) / 100;
      }

      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // Calculate total deposited and withdrawn
      const stats = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId: user.id, status: 'CONFIRMED' },
        _sum: { amount: true }
      });

      const deposited = stats.find(s => s.type === 'DEPOSIT')?._sum.amount || '0';
      const withdrawn = stats.find(s => s.type === 'WITHDRAW')?._sum.amount || '0';

      res.json({
        success: true,
        dashboard: {
          position: {
            shares,
            currentValue,
            currentValueTon: formatTon(currentValue),
            poolPercentage: poolPercentage.toFixed(4)
          },
          pool: {
            totalBalance: poolState.balance,
            totalBalanceTon: formatTon(poolState.balance),
            totalShares: poolState.totalShares,
            sharePrice: poolState.sharePrice,
            sharePriceTon: formatTon(poolState.sharePrice)
          },
          stats: {
            totalDeposited: deposited,
            totalDepositedTon: formatTon(deposited),
            totalWithdrawn: withdrawn,
            totalWithdrawnTon: formatTon(withdrawn),
            estimatedProfit: (BigInt(currentValue) - BigInt(deposited) + BigInt(withdrawn)).toString()
          },
          recentTransactions: recentTransactions.map(tx => ({
            ...tx,
            amountTon: formatTon(tx.amount)
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
