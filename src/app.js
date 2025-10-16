import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import mediaRoutes from './routes/mediaRoutes.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(
  morgan(':method :url :status :response-time ms', {
    skip: () => process.env.NODE_ENV === 'test'
  })
);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
app.use('/api/media', mediaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const publicDir = path.resolve('public');
app.use(express.static(publicDir));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const error = new Error('Not Found');
    error.status = 404;
    return next(error);
  }

  if (req.accepts('html')) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }

  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

export default app;
