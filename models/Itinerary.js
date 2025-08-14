const mongoose = require('mongoose');

// Activity sub-schema
const activitySchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
});

// main itinerary schema
const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  activities: [activitySchema]
}, {
  timestamps: true,
  createdAt: {
    type: Date,
  },
  updatedAt:{
    type: Date,
  }
});

itinerarySchema.index({ userId: 1, destination: 1 });

// Ensure virtual fields are serialized
itinerarySchema.set('toJSON', { virtuals: true });
itinerarySchema.set('toObject', { virtuals: true });

// Static method to get itineraries with filtering, sorting, and pagination
itinerarySchema.statics.getItineraries = function(filters = {}, sort = 'createdAt', page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  let query = this.find(filters);
  
  // Apply sorting
  if (sort === 'startDate') {
    query = query.sort({ startDate: 1 });
  } else if (sort === 'title') {
    query = query.sort({ title: 1 });
  } else {
    query = query.sort({ createdAt: -1 }); // default
  }
  
  return query
    .populate('userId', 'username firstName lastName')
    .skip(skip)
    .limit(parseInt(limit));
};

// Pre-save middleware to validate dates
itinerarySchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    const error = new Error('End date must be after start date');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Itinerary', itinerarySchema); 