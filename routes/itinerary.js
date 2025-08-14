const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Itinerary = require('../models/Itinerary');
const {
  authenticateToken,
} = require('../middleware/auth');
const {
  cacheItinerary,
  setCache,
  invalidateCache,
  createShareableLink,
  getShareableData
} = require('../middleware/cache');

const router = express.Router();


// @route   GET /api/itineraries/share/:shareableId
// @desc    Get public shareable itinerary (no authentication required)
// @access  Public
router.get('/share/:shareableId', async (req, res) => {
  try {
    const { shareableId } = req.params;

    // Get shareable data from Redis
    const shareableData = await getShareableData(shareableId);

    if (!shareableData) {
      return res.status(404).json({
        success: false,
        message: 'Shareable link not found or expired'
      });
    }

    res.json({
      success: true,
      data: {
        itinerary: shareableData.data,
        sharedAt: shareableData.createdAt
      }
    });
  } catch (error) {
    console.error('Get shareable itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shareable itinerary'
    });
  }
});



// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST /api/itineraries
// @desc    Create a new itinerary
// @access  Private
router.post('/', [
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
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, destination, startDate, endDate, activities } = req.body;

    // Create new itinerary
    const itinerary = new Itinerary({
      userId: req.user._id,
      title,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      activities: activities || []
    });

    await itinerary.save();

    // Populate user info
    await itinerary.populate('userId', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      data: { itinerary }
    });
  } catch (error) {
    console.error('Create itinerary error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create itinerary'
    });
  }
});

// @route   GET /api/itineraries
// @desc    Get all itineraries with filtering, sorting, and pagination
// @access  Private
router.get('/', [
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
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, sort = 'createdAt', destination } = req.query;

    let filters = { userId: req.user._id };

    // destination filter if provided
    if (destination) {
      filters.destination = { $regex: destination, $options: 'i' };
    }

    // get itineraries with pagination and sorting
    const itineraries = await Itinerary.getItineraries(filters, sort, page, limit);

    // Get total count for pagination
    const total = await Itinerary.countDocuments(filters);

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get itineraries'
    });
  }
});

// @route   GET /api/itineraries/:id
// @desc    Get itinerary by ID
// @access  Private
router.get('/:id', cacheItinerary, async (req, res) => {
  try {
    console.log("not from cached")
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Populate user info
    await itinerary.populate('userId', 'username firstName lastName');

    const responseData = {
      success: true,
      data: { itinerary }
    };

    // Cache the response data with 5 minutes TTL
    const cacheKey = `itinerary:${id}`;
    await setCache(cacheKey, responseData, 300); // 300 seconds = 5 minutes

    res.json(responseData);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get itinerary'
    });
  }
});

// @route   PUT /api/itineraries/:id
// @desc    Update itinerary
// @access  Private
router.put('/:id', [
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
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update itinerary
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('userId', 'username firstName lastName');

    // Invalidate cache for this itinerary
    await invalidateCache(`itinerary:${id}`);

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      data: { itinerary: updatedItinerary }
    });
  } catch (error) {
    console.error('Update itinerary error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update itinerary'
    });
  }
});

// @route   DELETE /api/itineraries/:id
// @desc    Delete itinerary
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Itinerary.findByIdAndDelete(id);

    // invalidate cache for this itinerary
    await invalidateCache(`itinerary:${id}`);

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary'
    });
  }
});

// @route   POST /api/itineraries/:id/share
// @desc    Create a shareable link for an itinerary
// @access  Private
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    // excluding sensitive information
    const { __v, _id, userId, ...publicData } = itinerary.toObject();

    // creating shareable link in Redis
    const shareableId = await createShareableLink(id, publicData);

    if (!shareableId) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create shareable link'
      });
    }

    const shareableUrl = `${req.protocol}://${req.get('host')}/api/itineraries/share/${shareableId}`;

    res.json({
      success: true,
      message: 'Shareable link created successfully',
      data: {
        shareableId,
        shareableUrl,
        expiresIn: '24 hours'
      }
    });
  } catch (error) {
    console.error('Create shareable link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shareable link'
    });
  }
});


module.exports = router;