import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth.routes';
import morgan from 'morgan';
import { env } from './config/env';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

// Security & middleware
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// TODO: Register routes here as you build them
app.use('/api/auth', authRouter);
// app.use('/api/stocks', stocksRouter);
// app.use('/api/orders', ordersRouter);
// app.use('/api/portfolio', portfolioRouter);
// app.use('/api/wallet', walletRouter);

// 404 handler and global error handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(env.port, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   TradeSphere API                    ║
  ║   Running on port ${env.port}              ║
  ║   Environment: ${env.nodeEnv}         ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;