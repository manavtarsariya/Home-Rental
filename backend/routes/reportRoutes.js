const express = require('express');
const router = express.Router();
const { createReport, getAllReports } = require('../controllers/reportController');


// POST /api/reports - submit a new report
router.post('/', createReport);

// GET /api/reports - fetch all reports
router.get('/', getAllReports);

module.exports = router;
