import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import { Address } from '@ton/core';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

// Generate nonce for TON Connect proof
router.get('/nonce', async (req: Request, res: Response) => {
  const nonce = crypto.randomBytes(32).toString('hex');
  
  // In production, store nonce in Redis/cache with TTL
  // For now, we include timestamp in the nonce
  const timestamp = Date.now();
  const fullNonce = `${nonce}:${timestamp}`;
  
  res.json({
    success: true,
    nonce: fullNonce
  });
});

// Verify TON Connect proof and login/register user
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      address,
      proof 
    } = req.body;

    if (!address) {
      throw new AppError('Wallet address is required', 400);
    }

    // Validate address format
    let walletAddress: string;
    try {
      const addr = Address.parse(address);
      walletAddress = addr.toString();
    } catch {
      throw new AppError('Invalid wallet address format', 400);
    }

    // In production, verify the TON Connect proof signature
    // For development, we skip proof verification
    if (process.env.NODE_ENV === 'production' && proof) {
      // Verify proof.signature against proof.payload using wallet's public key
      // This requires implementing TON Connect proof verification
      // See: https://docs.ton.org/develop/dapps/ton-connect/sign
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress }
      });
      console.log(`New user registered: ${walletAddress}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Get subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        hasSubscription: subscription?.status === 'ACTIVE'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin login
router.post('/admin/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Simple password check (in production, use bcrypt)
    const crypto = await import('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (admin.passwordHash !== passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate admin JWT
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        isAdmin: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
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

export default router;
