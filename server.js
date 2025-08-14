const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const DatabaseConfig = require('./src/config/database');
const config = require('./src/config/app');
const { HTTP_STATUS, MESSAGES } = require('./src/constants/statusCodes');

const authRoutes = require('./src/routes/auth');
const itineraryRoutes = require('./src/routes/itinerary');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use(express.json({ limit: config.bodyLimit.json }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit.urlencoded }));

app.use(morgan('combined'));

// MongoDB connection - only connect if not in test mode
if (config.server.environment !== 'test') {
  DatabaseConfig.connect(config.database.uri)
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.environment
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: MESSAGES.ROUTE_NOT_FOUND
  });
});

// global error handler
app.use((error, req, res, next) => {
  console.error('global error handler:', error);

  res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || MESSAGES.INTERNAL_SERVER_ERROR,
    ...(config.server.environment === 'development' && { stack: error.stack })
  });
});

// logging server status
if (config.server.environment !== 'test') {
  app.listen(config.server.port, () => {
    console.log(`server is running on port ${config.server.port}`);
    console.log(`environment: ${config.server.environment}`);
    console.log(`health check: http://${config.server.host}:${config.server.port}/health`);
  });
}

module.exports = app;
