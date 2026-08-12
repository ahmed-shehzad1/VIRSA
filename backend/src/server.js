const app = require('./app');
const config = require('./config/env');

const server = app.listen(config.port, () => {
  console.log(`Virsa backend running on port ${config.port} [${config.nodeEnv}]`);
});

// Fail loudly instead of hanging on unhandled promise rejections.
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
