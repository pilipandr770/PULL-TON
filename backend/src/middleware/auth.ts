import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
  };
}

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware for user authentication (TON wallet)
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      walletAddress: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = {
      id: user.id,
      walletAddress: user.walletAddress
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// Middleware for checking active subscription
export const subscriptionMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new AppError('Active subscription required', 403);
    }

    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
      throw new AppError('Subscription expired', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for admin authentication
export const adminMiddleware = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Admin authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      adminId: string;
      email: string;
      role: string;
      isAdmin: boolean;
    };

    if (!decoded.isAdmin) {
      throw new AppError('Admin access required', 403);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId }
    });

    if (!admin) {
      throw new AppError('Admin not found', 401);
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid admin token', 401));
    } else {
      next(error);
    }
  }
};
