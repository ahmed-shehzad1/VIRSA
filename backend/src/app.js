const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiters');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Behind a reverse proxy (Render, Railway, Vercel, etc.) so req.ip / secure
// cookies work correctly.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true, // required so the refresh-token cookie is sent
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(generalLimiter);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
