const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments();

    // Get user counts by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get property status counts
    const propertiesByStatus = await Property.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get booking status counts
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get revenue stats
    const revenueStats = await Payment.aggregate([
      {
        $match: { status: 'Completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    // Get recent activities
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');
    const recentProperties = await Property.find().sort('-createdAt').limit(5)
      .populate('owner', 'name').select('title address status createdAt');
    const recentBookings = await Booking.find().sort('-createdAt').limit(5)
      .populate('tenant', 'name').populate('property', 'title').select('status createdAt');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalBookings,
          totalPayments,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          averagePayment: revenueStats[0]?.averagePayment || 0
        },
        usersByRole,
        propertiesByStatus,
        bookingsByStatus,
        recentActivities: {
          users: recentUsers,
          properties: recentProperties,
          bookings: recentBookings
        }
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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all properties for admin
// @route   GET /api/admin/properties
// @access  Private (Admin)
const getAllProperties = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email contactNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update property status
// @route   PUT /api/admin/properties/:id/status
// @access  Private (Admin)
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('owner', 'name email')
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

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Cannot delete admin users
    if (user.role === 'Admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin users'
      });
    }

    await user.remove();

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
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllProperties,
  updatePropertyStatus,
  getAllBookings,
  deleteUser
};
