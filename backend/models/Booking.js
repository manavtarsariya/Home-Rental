const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  moveInDate: {
    type: Date,
    required: [true, 'Please specify move-in date']
  },
  leaseDuration: {
    type: Number, // in months
    required: [true, 'Please specify lease duration in months'],
    min: 1
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  ownerResponse: {
    message: String,
    respondedAt: Date
  },
  visitScheduled: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    visitDate: Date,
    visitTime: String,
    visitStatus: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled'
    }
  },
  agreementSigned: {
    type: Boolean,
    default: false
  },
  agreementDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
