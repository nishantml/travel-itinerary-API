const express = require('express');
const ItineraryController = require('../controllers/itineraryController');
const { 
  createItineraryValidation, 
  updateItineraryValidation, 
  getItinerariesValidation 
} = require('../validations/itinerary');
const { authenticateToken } = require('../middleware/auth');
const { cacheItinerary } = require('../middleware/cache');

const router = express.Router();

/**
 * @route   GET /api/itineraries/share/:shareableId
 * @desc    Get public shareable itinerary (no authentication required)
 * @access  Public
 */
router.get('/share/:shareableId', ItineraryController.getShareableItinerary);

// Apply authentication to all routes below
router.use(authenticateToken);

/**
 * @route   POST /api/itineraries
 * @desc    Create a new itinerary
 * @access  Private
 */
router.post('/', createItineraryValidation, ItineraryController.createItinerary);

/**
 * @route   GET /api/itineraries
 * @desc    Get all itineraries with filtering, sorting, and pagination
 * @access  Private
 */
router.get('/', getItinerariesValidation, ItineraryController.getItineraries);

/**
 * @route   GET /api/itineraries/:id
 * @desc    Get itinerary by ID
 * @access  Private
 */
router.get('/:id', cacheItinerary, ItineraryController.getItineraryById);

/**
 * @route   PUT /api/itineraries/:id
 * @desc    Update itinerary
 * @access  Private
 */
router.put('/:id', updateItineraryValidation, ItineraryController.updateItinerary);

/**
 * @route   DELETE /api/itineraries/:id
 * @desc    Delete itinerary
 * @access  Private
 */
router.delete('/:id', ItineraryController.deleteItinerary);

/**
 * @route   POST /api/itineraries/:id/share
 * @desc    Create a shareable link for an itinerary
 * @access  Private
 */
router.post('/:id/share', ItineraryController.createShareableLink);

module.exports = router; 