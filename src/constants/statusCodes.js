/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Error Codes
 */
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

/**
 * Common Messages
 */
const MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  ROUTE_NOT_FOUND: 'Route not found'
};

/**
 * Cache TTL (Time To Live) in seconds
 */
const CACHE_TTL = {
  ITINERARY: 300 // 5 minutes
};

module.exports = {
  HTTP_STATUS,
  ERROR_CODES,
  MESSAGES,
  CACHE_TTL
}; 