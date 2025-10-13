const Report = require('../models/Report');
const Property = require('../models/Property');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { property, owner, category, details, reporter } = req.body;
    const report = new Report({ property, owner, category, details, reporter });
    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('property', 'title address photos bedrooms bathrooms price rent furnished area')
      .populate('owner', 'name email')
      .populate('reporter', 'name email');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

// Take action on report
exports.takeActionOnReport = async (req, res) => {
  const { report_id } = req.params;
  const { action } = req.body;
  try {
    const report = await Report.findById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    if (!action || !action.action) {
      return res.status(400).json({ message: 'Action is required.' });
    }
    const act = action.action;
    if (act === 'Ignore') {
      await Report.findByIdAndUpdate(report_id, { status: 'Reviewed', action: 'Ignore' });
      return res.status(200).json({ message: 'Action ignored.' });
    }
    if (act === 'Remove_Property') {
      // Remove property and related data
      await Booking.deleteMany({ property: report.property });
      await Payment.deleteMany({ property: report.property });
      await Feedback.deleteMany({ property: report.property });
      await Property.findByIdAndDelete(report.property);
      await Report.findByIdAndUpdate(report_id, { status: 'Reviewed' , action: 'Remove_Property' });
      return res.status(200).json({ message: 'Property and related data removed.' });
    }
    if (act === 'Remove_Owner') {
      const ownerId = report.owner;
      // Find all properties of owner
      const ownerProperties = await Property.find({ owner: ownerId });
      const propertyIds = ownerProperties.map(p => p._id);
      // Remove related data for all properties
      await Booking.deleteMany({ property: { $in: propertyIds } });
      await Payment.deleteMany({ property: { $in: propertyIds } });
      await Feedback.deleteMany({ property: { $in: propertyIds } });
      await Property.deleteMany({ owner: ownerId });
      await User.findByIdAndDelete(ownerId);
      await Report.findByIdAndUpdate(report_id, { status: 'Reviewed' , action: 'Remove_Owner' });
      return res.status(200).json({ message: 'Owner, their properties, and related data removed.' });
    }
    return res.status(400).json({ message: 'Invalid action.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to take action', error: error.message });
  }
};
