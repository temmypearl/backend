import http from 'http';
import app from '../server';
import { connectDB, pool } from '../drizzle/db'; // ✅ import pool
import { logger, config } from '../config';

const server = http.createServer(app);

const startApp = async () => {
  try {
    await connectDB();
    logger.info('\x1b[32mDB:\x1b[0m SQL Connected');
    server.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`\x1b[36mServer:\x1b[0m Running on http://localhost:${config.PORT}`);
    }
    
  );
  } catch (error) {
    logger.error('\x1b[31mError:\x1b[0m Failed to start server:', error);
    process.exit(1);
  }
};

// Function to gracefully shut down the server and close connections
const gracefulShutdown = async () => {
  logger.info('\x1b[33mServer:\x1b[0m Shutting down...');

  try {
    await pool.end(); //Disconnect from Postgres
    logger.info('\x1b[32mDB:\x1b[0m Disconnected');

    server.close(() => {
      logger.info('\x1b[33mServer:\x1b[0m Closed remaining connections');
      process.exit(0);
    });
  } catch (error) {
    logger.error('\x1b[31mError:\x1b[0m during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('unhandledRejection', (err) => {
  logger.error('\x1b[31mUnhandled Rejection:\x1b[0m', err);
});
process.on('uncaughtException', (err) => {
  logger.error('\x1b[31mUncaught Exception:\x1b[0m', err);
  gracefulShutdown();
});

startApp();
