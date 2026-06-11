const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const config = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

const postController = require('./controllers/postController');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
const corsOptions = {
  origin: true,
  credentials: true,
};

app.options('/{*path}', cors(corsOptions)); // ← FIRST, with options
app.use(cors(corsOptions));                 // ← THEN this
// app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

if (config.nodeEnv !== 'test') {
  app.use(morgan('short', { stream: { write: msg => logger.info(msg.trim()) } }));
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

const upload = require('./middleware/upload');
app.post('/api/upload', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next(new AppError('No file uploaded', 400));
    next();
  });
}, postController.uploadImage);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (_req, res) => res.json({ success: true, message: 'Social App API is running', version: '2.0.0' }));

app.all('/{*unmatched}', (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(errorHandler);

connectDB(config.mongoUri);

if (!config.cloudinary.cloudName || config.cloudinary.cloudName === 'YOUR_CLOUD_NAME') {
  logger.warn('Cloudinary not configured — image upload will fail');
}

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

module.exports = app;
