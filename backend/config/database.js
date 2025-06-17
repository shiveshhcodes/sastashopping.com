const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// Configure mongoose
mongoose.set('strictQuery', true);

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Create connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.mongodbUri, options);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
      port: conn.connection.port,
      timestamp: new Date().toISOString()
    });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established', {
        timestamp: new Date().toISOString()
      });
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected', {
        timestamp: new Date().toISOString()
      });
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination', {
          timestamp: new Date().toISOString()
        });
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB connection closure:', {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Test the connection with a simple query
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Database health check failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

// Get connection stats
const getConnectionStats = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models),
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  connectDB,
  checkDatabaseHealth,
  getConnectionStats,
  mongoose
}; 