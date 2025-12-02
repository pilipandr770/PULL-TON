import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import poolRoutes from './routes/pool';
import userRoutes from './routes/user';
import subscriptionRoutes from './routes/subscription';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhook';
import { errorHandler } from './middleware/errorHandler';
import { startPoolSync } from './services/poolSync';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Webhook route needs raw body (before json middleware)
app.use('/api/webhook', webhookRoutes);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pool', poolRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start background pool sync
  startPoolSync();
});

export default app;
