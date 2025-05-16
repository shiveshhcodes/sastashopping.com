import uvicorn
import logging
import sys
import signal
from app.config import logger
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting comparison service...")
    try:
        yield
    finally:
        # Shutdown
        logger.info("Shutting down comparison service...")

def handle_exit(signum, frame):
    logger.info(f"Received signal {signum}. Shutting down gracefully...")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)
    
    try:
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('comparison_service.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        # Start the server
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True,
            lifespan="on"
        )
    except Exception as e:
        logger.error(f"Failed to start comparison service: {str(e)}")
        sys.exit(1) 