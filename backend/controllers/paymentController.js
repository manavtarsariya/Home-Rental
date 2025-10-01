const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private (Tenant)
const createPayment = async (req, res, next) => {
  try {
    const { propertyId, bookingId, amount, paymentType, paymentMethod, description } = req.body;

    // Verify property and booking exist
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      // Verify booking belongs to user
      if (booking.tenant.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to make payment for this booking'
        });
      }
    }

    // Create payment record
    const payment = await Payment.create({
      tenant: req.user.id,
      property: propertyId,
      booking: bookingId,
      amount,
      paymentType,
      paymentMethod,
      description,
      status: 'Completed', // Since it's a dummy payment system
      dueDate: req.body.dueDate || new Date()
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('tenant', 'name email')
      .populate('property', 'title address')
      .populate('booking', 'status moveInDate');

    res.status(201).json({
      success: true,
      data: populatedPayment
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'Tenant') {
      query.tenant = req.user.id;
    } else if (req.user.role === 'Owner') {
      // Get payments for owner's properties
      const ownerProperties = await Property.find({ owner: req.user.id }).select('_id');
      const propertyIds = ownerProperties.map(property => property._id);
      query.property = { $in: propertyIds };
    }
    // Admin can see all payments

    const payments = await Payment.find(query)
      .populate('tenant', 'name email contactNumber')
      .populate('property', 'title address rent')
      .populate('booking', 'status moveInDate leaseDuration')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tenant', 'name email contactNumber')
      .populate('property', 'title address rent owner')
      .populate('booking', 'status moveInDate leaseDuration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Check if user is authorized to view this payment
    if (req.user.role !== 'Admin' && 
        payment.tenant._id.toString() !== req.user.id && 
        payment.property.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Process dummy payment
// @route   POST /api/payments/process
// @access  Private (Tenant)
const processPayment = async (req, res, next) => {
  try {
    const { 
      paymentId, 
      cardNumber, 
      expiryDate, 
      cvv, 
      cardHolderName 
    } = req.body;

    // Validate payment exists
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Verify payment belongs to user
    if (payment.tenant.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to process this payment'
      });
    }

    // Dummy payment processing (simulate success/failure)
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      payment.status = 'Completed';
      payment.paymentGatewayResponse = {
        status: 'success',
        transactionId: payment.transactionId,
        processedAt: new Date(),
        cardLast4: cardNumber.slice(-4)
      };
    } else {
      payment.status = 'Failed';
      payment.paymentGatewayResponse = {
        status: 'failed',
        error: 'Transaction declined by bank',
        processedAt: new Date()
      };
    }

    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (Owner/Admin)
const getPaymentStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'Owner') {
      // Get stats for owner's properties
      const ownerProperties = await Property.find({ owner: req.user.id }).select('_id');
      const propertyIds = ownerProperties.map(property => property._id);
      matchQuery.property = { $in: propertyIds };
    }

    const stats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$amount', 0] } },
          totalPayments: { $sum: 1 },
          completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } }
        }
      }
    ]);

    // Get monthly revenue for current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          ...matchQuery,
          status: 'Completed',
          createdAt: { 
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalRevenue: 0,
          totalPayments: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0
        },
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPayment,
  processPayment,
  getPaymentStats
};
