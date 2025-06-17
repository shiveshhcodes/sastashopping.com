const Redis = require('redis');
const config = require('../config/config');

// Create Redis client
const redisClient = Redis.createClient({
  url: config.database.redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Max retries reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();

// Cache middleware
const cache = (duration = config.cache.duration) => {
  return async (req, res, next) => {
    if (!config.features.caching) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json method
      res.json = function(body) {
        // Store in cache
        redisClient.set(key, JSON.stringify(body), {
          EX: duration / 1000
        }).catch(err => console.error('Cache set error:', err));

        // Call original res.json
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    if (!config.features.caching) {
      return next();
    }

    try {
      const keys = await redisClient.keys('cache:*');
      
      for (const pattern of patterns) {
        const matchingKeys = keys.filter(key => key.includes(pattern));
        if (matchingKeys.length > 0) {
          await Promise.all(matchingKeys.map(key => redisClient.del(key)));
        }
      }

      next();
    } catch (error) {
      console.error('Cache invalidation error:', error);
      next();
    }
  };
};

// Cache health check
const checkCacheHealth = async () => {
  try {
    await redisClient.set('health-check', 'ok', {
      EX: 10
    });
    const result = await redisClient.get('health-check');
    return result === 'ok';
  } catch (error) {
    console.error('Cache health check failed:', error);
    return false;
  }
};

// Handle Redis client events
redisClient.on('error', (error) => {
  console.error('Redis client error:', error);
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

module.exports = {
  cache,
  invalidateCache,
  checkCacheHealth,
  redisClient
}; 