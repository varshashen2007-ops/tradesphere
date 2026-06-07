import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimit.middleware';
import authRouter from './routes/auth.routes';
import stocksRouter from './routes/stock.routes';
import { PriceSimulator } from './services/priceSimulator.service';

const app = express();
const httpServer = createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(generalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    websocket: 'active',
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/stocks', stocksRouter);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Client subscribes to a stock's price feed
  socket.on('subscribe:stock', (symbol: string) => {
    socket.join(`stock:${symbol.toUpperCase()}`);
    console.log(`${socket.id} subscribed to stock:${symbol.toUpperCase()}`);
  });

  // Client unsubscribes
  socket.on('unsubscribe:stock', (symbol: string) => {
    socket.leave(`stock:${symbol.toUpperCase()}`);
  });

  // Client subscribes to their own portfolio updates
  socket.on('subscribe:portfolio', (userId: string) => {
    socket.join(`portfolio:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the price simulator
const simulator = new PriceSimulator(io);
simulator.start();

httpServer.listen(env.port, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   TradeSphere API                    ║
  ║   HTTP  → port ${env.port}                ║
  ║   WS    → port ${env.port} (shared)       ║
  ║   Env   → ${env.nodeEnv}             ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;