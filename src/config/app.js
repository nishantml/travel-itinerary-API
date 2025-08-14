/**
 * Application configuration
 */
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },

  // MongoDB configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tmtc_assignment'
  },

  // Request body limits
  bodyLimit: {
    json: '10mb',
    urlencoded: '10mb'
  }
}; 