const express = require('express');
const {
  createPayment,
  getPayments,
  getPayment,
  processPayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, authorize('Tenant'), createPayment);

router.get('/stats', protect, authorize('Owner', 'Admin'), getPaymentStats);
router.post('/process', protect, authorize('Tenant'), processPayment);

router.route('/:id')
  .get(protect, getPayment);

module.exports = router;
