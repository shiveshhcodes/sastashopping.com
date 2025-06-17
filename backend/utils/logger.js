const winston = require('winston');
const config = require('../config/config');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log directory
const logDir = 'logs';

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'sastashopping-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all logs with level 'debug' and below to debug.log
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// If we're not in production, log to the console with colors
if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      requestId: req.requestId
    });
  });

  next();
};

// Add error logging middleware
logger.errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    requestId: req.requestId
  });

  next(err);
};

// Add performance logging
logger.performance = (operation, startTime) => {
  const endTime = process.hrtime(startTime);
  const duration = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

  logger.debug('Performance measurement', {
    operation,
    duration: `${duration.toFixed(2)}ms`,
    timestamp: new Date().toISOString()
  });
};

// Add security logging
logger.security = (event, details) => {
  logger.warn('Security event', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

// Add audit logging
logger.audit = (action, user, resource, details) => {
  logger.info('Audit log', {
    action,
    user,
    resource,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger; 