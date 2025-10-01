const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    required: [true, 'Please add a rating']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  categories: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    location: {
      type: Number,
      min: 1,
      max: 5
    },
    amenities: {
      type: Number,
      min: 1,
      max: 5
    },
    ownerBehavior: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  ownerResponse: {
    message: String,
    respondedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one feedback per tenant per property
feedbackSchema.index({ tenant: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
