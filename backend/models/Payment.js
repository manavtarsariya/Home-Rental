const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'Please add payment amount']
  },
  paymentType: {
    type: String,
    enum: ['Rent', 'Security Deposit', 'Maintenance', 'Late Fee', 'Other'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'UPI', 'Bank Transfer', 'Cash', 'Dummy'],
    default: 'Dummy'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  transactionId: {
    type: String,
    unique: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  isPaid: {
    type: Boolean,
    default: function() {
      return this.status === 'Completed';
    }
  },
  lateFeesApplied: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  receiptUrl: String,
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate transaction ID before saving
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
