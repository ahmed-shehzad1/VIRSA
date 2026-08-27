const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiters');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const noIndex = require('./middleware/noIndex.middleware');

const app = express();

app.set('trust proxy', 1);

// 17.5 - hardened security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'], // allow Supabase Storage image URLs
        connectSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // needed so avatar/media images load on the frontend origin
    hsts: config.nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 17.6 - supports a comma-separated list of allowed origins for staging/prod
const allowedOrigins = config.clientUrl.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
// 19.6 - if the API is ever hit directly by a crawler (e.g. api.virsa.app),
// this blocks it outright. The frontend's own robots.txt (served by the
// frontend app) governs the actual user-facing site.
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

// 18.5 - gzip API responses
app.use(compression());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(generalLimiter);
app.use('/api', noIndex, routes);
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;