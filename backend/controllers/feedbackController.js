const Feedback = require('../models/Feedback');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private (Tenant)
const createFeedback = async (req, res, next) => {
  try {
    const { propertyId, bookingId, rating, comment, categories } = req.body;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Verify booking exists and belongs to user (if provided)
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.tenant.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Invalid booking or not authorized'
        });
      }
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      tenant: req.user.id,
      property: propertyId
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        error: 'You have already provided feedback for this property'
      });
    }

    const feedback = await Feedback.create({
      tenant: req.user.id,
      property: propertyId,
      booking: bookingId,
      rating,
      comment,
      categories
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('tenant', 'name')
      .populate('property', 'title address');

    res.status(201).json({
      success: true,
      data: populatedFeedback
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get feedback for property
// @route   GET /api/feedback/property/:propertyId
// @access  Public
const getPropertyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ 
      property: req.params.propertyId,
      isVisible: true 
    })
    .populate('tenant', 'name profileImage')
    .sort('-createdAt');

    // Calculate average rating
    const totalRating = feedback.reduce((sum, fb) => sum + fb.rating, 0);
    const averageRating = feedback.length > 0 ? (totalRating / feedback.length).toFixed(1) : 0;

    // Calculate category averages
    const categoryAverages = {};
    if (feedback.length > 0) {
      const categories = ['cleanliness', 'location', 'amenities', 'ownerBehavior', 'valueForMoney'];
      categories.forEach(category => {
        const validRatings = feedback
          .filter(fb => fb.categories && fb.categories[category])
          .map(fb => fb.categories[category]);
        
        if (validRatings.length > 0) {
          categoryAverages[category] = (
            validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
          ).toFixed(1);
        }
      });
    }

    res.status(200).json({
      success: true,
      count: feedback.length,
      averageRating: parseFloat(averageRating),
      categoryAverages,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback/my
// @access  Private (Tenant)
const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ tenant: req.user.id })
      .populate('property', 'title address photos')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Tenant)
const updateFeedback = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    // Check if user owns this feedback
    if (feedback.tenant.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this feedback'
      });
    }

    feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('tenant', 'name').populate('property', 'title address');

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Tenant/Admin)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    // Check if user owns this feedback or is admin
    if (feedback.tenant.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this feedback'
      });
    }

    await feedback.remove();

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
  createFeedback,
  getPropertyFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback
};
