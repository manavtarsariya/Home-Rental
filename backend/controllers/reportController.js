const Report = require('../models/Report');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { property, owner, category, reporter, details } = req.body;
    const report = new Report({ property, owner, category, reporter, details });
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
      .populate('property', 'title address')
      .populate('owner', 'name email')
      .populate('reporter', 'name email');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

// Optionally, add more handlers (update status, etc.)
