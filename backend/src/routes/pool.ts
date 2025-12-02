import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { getPoolState, getUserShares, formatTon, getPoolAddress } from '../lib/ton';

const router = Router();

// Get pool info (public)
router.get('/info', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get live data from chain
    const poolAddress = getPoolAddress();
    let poolData;

    if (poolAddress) {
      poolData = await getPoolState();
    }

    // Get cached stats
    const cachedStats = await prisma.poolStats.findUnique({
      where: { id: 'singleton' }
    });

    // Use live data if available, otherwise cached
    const balance = poolData?.balance || cachedStats?.totalBalance || '0';
    const totalShares = poolData?.totalShares || cachedStats?.totalShares || '0';
    const sharePrice = poolData?.sharePrice || cachedStats?.sharePrice || '0';

    res.json({
      success: true,
      pool: {
        address: poolAddress?.toString() || null,
        balance: balance,
        balanceTon: formatTon(balance),
        totalShares: totalShares,
        sharePrice: sharePrice,
        sharePriceTon: formatTon(sharePrice),
        totalUsers: cachedStats?.totalUsers || 0,
        minDeposit: '1000000000', // 1 TON
        minDepositTon: '1',
        network: process.env.TON_NETWORK || 'testnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's pool position (requires wallet address in query)
router.get('/position/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    const shares = await getUserShares(address);
    const poolState = await getPoolState();

    // Calculate estimated value
    let estimatedValue = '0';
    if (BigInt(poolState.totalShares) > 0n) {
      estimatedValue = (
        (BigInt(poolState.balance) * BigInt(shares)) / BigInt(poolState.totalShares)
      ).toString();
    }

    // Calculate percentage
    let percentage = 0;
    if (BigInt(poolState.totalShares) > 0n) {
      percentage = Number(BigInt(shares) * 10000n / BigInt(poolState.totalShares)) / 100;
    }

    // Calculate profit based on share price
    // Initial share price was 1 TON = 1 share (1e9 nanoton = 1e9 nanoshares)
    // Current value of shares - initial deposit value
    const sharesAmount = BigInt(shares);
    const initialValue = sharesAmount; // 1:1 ratio at start (in nanoton)
    const currentValue = BigInt(estimatedValue);
    const profit = currentValue - initialValue;
    const profitPercent = initialValue > 0n 
      ? Number(profit * 10000n / initialValue) / 100 
      : 0;

    res.json({
      success: true,
      position: {
        shares: shares,
        estimatedValue: estimatedValue,
        estimatedValueTon: formatTon(estimatedValue),
        poolPercentage: percentage.toFixed(4),
        // Profit calculations
        initialValue: initialValue.toString(),
        initialValueTon: formatTon(initialValue.toString()),
        profit: profit.toString(),
        profitTon: formatTon(profit > 0n ? profit.toString() : '0'),
        profitPercent: profitPercent.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get deposit instructions
router.get('/deposit-info', (req: Request, res: Response) => {
  const poolAddress = getPoolAddress();

  res.json({
    success: true,
    deposit: {
      address: poolAddress?.toString() || 'Contract not deployed',
      comment: 'deposit',
      minAmount: '1000000000',
      minAmountTon: '1',
      instructions: [
        '1. Open your TON wallet (Tonkeeper, TON Wallet, etc.)',
        '2. Send TON to the pool address',
        '3. Add "deposit" as the comment/memo',
        '4. Minimum deposit: 1 TON',
        '5. You will receive shares proportional to your deposit'
      ]
    }
  });
});

// Get withdraw instructions
router.get('/withdraw-info', (req: Request, res: Response) => {
  res.json({
    success: true,
    withdraw: {
      instructions: [
        '1. Determine how many shares you want to withdraw',
        '2. Send a Withdraw message to the pool contract',
        '3. You will receive TON proportional to your shares',
        '4. Transaction requires ~0.05 TON for gas'
      ],
      note: 'Withdrawals can be done through the dashboard or directly via wallet'
    }
  });
});

export default router;
