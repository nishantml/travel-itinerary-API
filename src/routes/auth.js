const express = require('express');
const AuthController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validations/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginValidation, AuthController.login);

module.exports = router; 