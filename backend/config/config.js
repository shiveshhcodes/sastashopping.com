const Joi = require('joi');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define configuration schema
const envSchema = Joi.object({
  // Server configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5050),
  
  // Security
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000'),
  
  // Database
  MONGODB_URI: Joi.string().allow('').default(''),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  
  // External services
  COMPARISON_SERVICE_URL: Joi.string().default('http://localhost:5051'),
  SCRAPING_TIMEOUT: Joi.number().default(30000),
  MAX_RETRIES: Joi.number().default(3),
  
  // Cache
  CACHE_DURATION_MINUTES: Joi.number().default(60),
  
  // Feature flags
  ENABLE_CACHING: Joi.boolean().default(true),
  ENABLE_RATE_LIMITING: Joi.boolean().default(true),
  ENABLE_LOGGING: Joi.boolean().default(true),
  
  // Monitoring
  ENABLE_METRICS: Joi.boolean().default(true),
  METRICS_PORT: Joi.number().default(9090),
  
  // API Keys (if needed)
  AMAZON_API_KEY: Joi.string().allow(''),
  FLIPKART_API_KEY: Joi.string().allow(''),
  MYNTRA_API_KEY: Joi.string().allow('')
}).unknown();

// Validate configuration
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  security: {
    jwtSecret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_EXPIRES_IN,
    allowedOrigins: envVars.ALLOWED_ORIGINS.split(','),
  },
  
  database: {
    mongodbUri: envVars.MONGODB_URI,
    redisUrl: envVars.REDIS_URL,
  },
  
    rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
    enabled: envVars.ENABLE_LOGGING,
  },
  
  services: {
    comparisonService: {
      url: envVars.COMPARISON_SERVICE_URL,
      timeout: envVars.SCRAPING_TIMEOUT,
      maxRetries: envVars.MAX_RETRIES,
    },
  },
  
  cache: {
    duration: envVars.CACHE_DURATION_MINUTES * 60 * 1000, // Convert to milliseconds
    enabled: envVars.ENABLE_CACHING,
  },
  
  features: {
    rateLimiting: envVars.ENABLE_RATE_LIMITING,
    caching: envVars.ENABLE_CACHING,
    logging: envVars.ENABLE_LOGGING,
  },
  
  monitoring: {
    enabled: envVars.ENABLE_METRICS,
    port: envVars.METRICS_PORT,
  },
  
  apiKeys: {
    amazon: envVars.AMAZON_API_KEY,
    flipkart: envVars.FLIPKART_API_KEY,
    myntra: envVars.MYNTRA_API_KEY,
  },
};

module.exports = config; 