import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { config } from './config/index.js';
import { seedDevAdmin } from './config/adminSeed.js';

dotenv.config();

const app = express();
const PORT = config.port || 5000;

app.use(helmet());
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed.'));
  }
}));
app.use(express.json({ limit: '32kb' }));
app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.use((_error, _req, res, _next) => {
  console.error('API Error:', _error);
  return res.status(500).json({ error: 'সার্ভারে অপ্রত্যাশিত সমস্যা হয়েছে।' });
});

const startServer = async () => {
  if (config.env === 'production' && !config.mongoUri) {
    throw new Error('MONGODB_URI is required in production.');
  }

  const connected = await connectDatabase(config.mongoUri);
  if (!connected && config.env === 'production') {
    throw new Error('Database connection failed in production mode.');
  }

  // Seed a dev/test admin user if env vars are configured
  if (connected) {
    await seedDevAdmin();
  }

  const server = app.listen(PORT, () => {
    console.log(`FA AGENCY™ EARN API running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
