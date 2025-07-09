const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { createNamespace } = require('cls-hooked');
const CircuitBreaker = require('opossum');
const config = require('./config/config');
const { errorHandler } = require('./middlewares/errorHandler');
const { validate } = require('./middlewares/validation');
const { cache, checkCacheHealth } = require('./middlewares/cache');
const { monitoring, metricsHandler } = require('./middlewares/monitoring');
const routes = require('./routes');
const { scrapeAmazonProductByUrl } = require('./utils/amazonScraper');

// Load environment variables
dotenv.config();

// Create namespace for request tracking
const requestNamespace = createNamespace('request-context');

// Configure logger with better formatting and rotation
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sastashopping-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const app = express();

// Cookie parser middleware
app.use(cookieParser());

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// Granular CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting with different rules for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow more requests for API endpoints
  message: 'Too many API requests, please try again later.'
});

// Apply rate limiters
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);
app.use('/', generalLimiter);

// Request tracking middleware
app.use((req, res, next) => {
  requestNamespace.run(() => {
    const requestId = uuidv4();
    requestNamespace.set('requestId', requestId);
    req.requestId = requestId;
    next();
  });
});

// Enhanced logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}));

// Compression middleware
app.use(compression());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Monitoring middleware
app.use(monitoring);

// Circuit breaker for external services
const breaker = new CircuitBreaker(async (url) => {
  // Your external service call here
}, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is up and running',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    requestId: req.requestId,
    services: {
      cache: await checkCacheHealth(),
      // Add other service health checks here
    }
  };
  res.json(health);
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Use global route loader with caching
app.use('/api/v1', cache(), routes);

// Use notFound and errorHandler middlewares
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    requestId: req.requestId
  });
});

app.use(errorHandler);

// Enhanced global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/compare/amazon', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });
  try {
    const data = await scrapeAmazonProductByUrl(url);
    if (!data) return res.status(500).json({ error: 'Scraping failed' });
    res.json(data[0]); // Or return full array if needed
  } catch (error) {
    res.status(500).json({ error: error.message || 'Scraping failed' });
  }
});