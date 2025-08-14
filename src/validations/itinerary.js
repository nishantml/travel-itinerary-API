const { body, query } = require('express-validator');

/**
 * Validation schemas for itinerary endpoints
 */

const createItineraryValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('destination')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Destination is required'),

  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),

  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),

  body('activities.*.time')
    .if(body('activities').exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage('Activity time is required'),

  body('activities.*.description')
    .if(body('activities').exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage('Activity description is required'),

  body('activities.*.location')
    .if(body('activities').exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage('Activity location is required')
];

const updateItineraryValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('destination')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Destination cannot be empty'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),

  body('activities.*.time')
    .if(body('activities').exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage('Activity time is required'),

  body('activities.*.description')
    .if(body('activities').exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage('Activity description is required'),

  body('activities.*.location')
    .if(body('activities').exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage('Activity location is required')
];

const getItinerariesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['createdAt', 'startDate', 'title'])
    .withMessage('Sort must be createdAt, startDate, or title'),

  query('destination')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Destination filter cannot be empty')
];

module.exports = {
  createItineraryValidation,
  updateItineraryValidation,
  getItinerariesValidation
}; 