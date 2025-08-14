const { body } = require('express-validator');

/**
 * Validation schemas for authentication endpoints
 */

const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  registerValidation,
  loginValidation
}; 