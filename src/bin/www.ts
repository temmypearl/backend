import http from 'http';
import app from '../server';
import { sequelize, connectDB } from '../config';
import { logger, config } from '../config';
// import { startTokenRefresh, stopTokenRefresh } from '../helpers';

const server = http.createServer(app);

// Function to start the server
const startApp = async () => {
  try {
    // Connect to the database
    await connectDB();
    logger.info('\x1b[32mDB:\x1b[0m SQL Connected');



    // Start the server
    server.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`\x1b[36mServer:\x1b[0m Running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('\x1b[31mError:\x1b[0m Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info('\x1b[33mServer:\x1b[0m Shutting down...');
    


  // Then disconnect from the database
  await sequelize.close();
  logger.info('\x1b[32mDB:\x1b[0m Disconnected');

  // Finally close the server
  server.close(() => {
    logger.info('\x1b[33mServer:\x1b[0m Closed remaining connections');
    process.exit(0);
  });
};

// Handle termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('unhandledRejection', (err) => {
  logger.error('\x1b[31mUnhandled Rejection:\x1b[0m', err);
});
process.on('uncaughtException', (err) => {
  logger.error('\x1b[31mUncaught Exception:\x1b[0m', err);
  gracefulShutdown();
});

// Start the app
startApp();
