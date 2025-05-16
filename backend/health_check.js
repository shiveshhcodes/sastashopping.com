const axios = require('axios');
const logger = require('./utils/logger');

const SERVICES = {
    nodeBackend: {
        name: 'Node.js Backend',
        url: 'http://localhost:5050/health',
        required: true
    },
    pythonService: {
        name: 'Python Comparison Service',
        url: 'http://localhost:8000/health',
        required: true
    }
};

async function checkServiceHealth(service) {
    try {
        const response = await axios.get(service.url, { timeout: 5000 });
        return {
            name: service.name,
            status: 'healthy',
            details: response.data
        };
    } catch (error) {
        return {
            name: service.name,
            status: 'unhealthy',
            error: error.message
        };
    }
}

async function checkAllServices() {
    logger.info('Starting health check for all services...');
    
    const results = await Promise.all(
        Object.values(SERVICES).map(service => checkServiceHealth(service))
    );

    // Print results
    results.forEach(result => {
        if (result.status === 'healthy') {
            logger.info(`✅ ${result.name} is healthy:`, result.details);
        } else {
            logger.error(`❌ ${result.name} is unhealthy:`, result.error);
        }
    });

    // Check if all required services are healthy
    const allHealthy = results.every(result => result.status === 'healthy');
    if (!allHealthy) {
        logger.error('Some services are unhealthy. Please check the logs above.');
        process.exit(1);
    }

    logger.info('All services are healthy! 🎉');
}

// Run health check
checkAllServices().catch(error => {
    logger.error('Health check failed:', error);
    process.exit(1);
}); 