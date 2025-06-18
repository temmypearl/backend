import http from 'http';
import app from '../server';
import { connectDB, pool } from '../drizzle/db';
import { logger, config } from '../config';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store user socket mappings
const userSocketMap = new Map();

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('register', (userId: string) => {
    userSocketMap.set(userId, socket.id);
    logger.info(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('chat:send', ({ senderId, recipientId, doctorId, content }) => {
    const recipientSocketId = userSocketMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('chat:receive', {
        conversationId: `${senderId}-${recipientId}-${doctorId}`,
        senderId,
        content,
        timestamp: new Date().toISOString()
      });
      logger.info(`Message sent from ${senderId} to ${recipientId}`);
    } else {
      socket.emit('error', { message: 'Recipient not found or offline' });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from mapping when they disconnect
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        logger.info(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

const startApp = async () => {
  try {
    await connectDB();
    logger.info('\x1b[32mDB:\x1b[0m SQL Connected');
    server.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`\x1b[36mServer:\x1b[0m Running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('\x1b[31mError:\x1b[0m Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  logger.info('\x1b[33mServer:\x1b[0m Shutting down...');

  try {
    await pool.end();
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
