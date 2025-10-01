const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Private (Tenant)
const createBooking = async (req, res, next) => {
  try {
    const { propertyId, moveInDate, leaseDuration, message } = req.body;

    // Get property details
    const property = await Property.findById(propertyId).populate('owner');

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    if (!property.isAvailable || property.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        error: 'Property is not available for booking'
      });
    }

    // Check if user already has a pending booking for this property
    const existingBooking = await Booking.findOne({
      property: propertyId,
      tenant: req.user.id,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        error: 'You already have a booking request for this property'
      });
    }

    // Calculate total amount
    const monthlyRent = property.rent;
    const securityDeposit = property.securityDeposit || monthlyRent * 2;
    const totalAmount = monthlyRent + securityDeposit;

    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user.id,
      owner: property.owner._id,
      moveInDate,
      leaseDuration,
      monthlyRent,
      securityDeposit,
      totalAmount,
      message
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address rent type')
      .populate('tenant', 'name email contactNumber')
      .populate('owner', 'name email contactNumber');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'Tenant') {
      query.tenant = req.user.id;
    } else if (req.user.role === 'Owner') {
      query.owner = req.user.id;
    }
    // Admin can see all bookings

    const bookings = await Booking.find(query)
      .populate('property', 'title address rent type photos')
      .populate('tenant', 'name email contactNumber')
      .populate('owner', 'name email contactNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title address rent type photos amenities')
      .populate('tenant', 'name email contactNumber')
      .populate('owner', 'name email contactNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (req.user.role !== 'Admin' && 
        booking.tenant._id.toString() !== req.user.id && 
        booking.owner._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, ownerResponse } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is authorized to update this booking
    if (req.user.role !== 'Admin' && booking.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    if (ownerResponse) {
      booking.ownerResponse = {
        message: ownerResponse,
        respondedAt: new Date()
      };
    }

    // If approved, mark property as rented
    if (status === 'Approved') {
      await Property.findByIdAndUpdate(booking.property, {
        isAvailable: false,
        status: 'Rented'
      });
    }

    // If rejected or cancelled, mark property as available
    if (status === 'Rejected' || status === 'Cancelled') {
      await Property.findByIdAndUpdate(booking.property, {
        isAvailable: true,
        status: 'Approved'
      });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address rent type')
      .populate('tenant', 'name email contactNumber')
      .populate('owner', 'name email contactNumber');

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Schedule property visit
// @route   PUT /api/bookings/:id/visit
// @access  Private (Owner/Tenant)
const scheduleVisit = async (req, res, next) => {
  try {
    const { visitDate, visitTime } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is authorized
    if (booking.tenant.toString() !== req.user.id && 
        booking.owner.toString() !== req.user.id &&
        req.user.role !== 'Admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to schedule visit for this booking'
      });
    }

    booking.visitScheduled = {
      isScheduled: true,
      visitDate: new Date(visitDate),
      visitTime,
      visitStatus: 'Scheduled'
    };

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private (Tenant)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is authorized to cancel this booking
    if (booking.tenant.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    // Can only cancel pending bookings
    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only cancel pending bookings'
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: {}
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
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  scheduleVisit,
  cancelBooking
};
