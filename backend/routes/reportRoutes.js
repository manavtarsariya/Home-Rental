const express = require('express');
const router = express.Router();
const { createReport, getAllReports, takeActionOnReport } = require('../controllers/reportController');


// POST /api/reports - submit a new report
router.post('/', createReport);

// GET /api/reports - fetch all reports
router.get('/', getAllReports);

// POST /api/reports/takeaction/:report_id - take action on a report
router.patch('/takeaction/:report_id', takeActionOnReport);

module.exports = router;
