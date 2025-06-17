const winston = require('winston');
const config = require('../config/config');

// Create metrics logger
const metricsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'metrics' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/metrics.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Performance metrics
const metrics = {
  requests: {
    total: 0,
    byEndpoint: {},
    byMethod: {},
    byStatus: {},
  },
  responseTime: {
    min: Infinity,
    max: 0,
    avg: 0,
    total: 0,
  },
  errors: {
    total: 0,
    byType: {},
  },
};

// Reset metrics periodically
setInterval(() => {
  metrics.requests.total = 0;
  metrics.requests.byEndpoint = {};
  metrics.requests.byMethod = {};
  metrics.requests.byStatus = {};
  metrics.responseTime.min = Infinity;
  metrics.responseTime.max = 0;
  metrics.responseTime.avg = 0;
  metrics.responseTime.total = 0;
  metrics.errors.total = 0;
  metrics.errors.byType = {};
}, 3600000); // Reset every hour

// Monitoring middleware
const monitoring = (req, res, next) => {
  if (!config.monitoring.enabled) {
    return next();
  }

  const start = process.hrtime();
  const requestId = req.requestId;

  // Track request
  metrics.requests.total++;
  metrics.requests.byEndpoint[req.path] = (metrics.requests.byEndpoint[req.path] || 0) + 1;
  metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1;

  // Log request start
  metricsLogger.info('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  // Track response
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    // Update response time metrics
    metrics.responseTime.min = Math.min(metrics.responseTime.min, responseTime);
    metrics.responseTime.max = Math.max(metrics.responseTime.max, responseTime);
    metrics.responseTime.total += responseTime;
    metrics.responseTime.avg = metrics.responseTime.total / metrics.requests.total;

    // Track status code
    metrics.requests.byStatus[res.statusCode] = (metrics.requests.byStatus[res.statusCode] || 0) + 1;

    // Log request completion
    metricsLogger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
    });
  });

  // Track errors
  res.on('error', (error) => {
    metrics.errors.total++;
    metrics.errors.byType[error.name] = (metrics.errors.byType[error.name] || 0) + 1;

    metricsLogger.error('Request error', {
      requestId,
      method: req.method,
      path: req.path,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

// Get current metrics
const getMetrics = () => {
  return {
    ...metrics,
    timestamp: new Date().toISOString(),
  };
};

// Export metrics endpoint handler
const metricsHandler = (req, res) => {
  if (!config.monitoring.enabled) {
    return res.status(503).json({ error: 'Monitoring is disabled' });
  }

  res.json(getMetrics());
};

module.exports = {
  monitoring,
  metricsHandler,
  getMetrics,
}; 