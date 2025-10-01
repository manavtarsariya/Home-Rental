const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  scheduleVisit,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('Tenant'), createBooking);

router.route('/:id')
  .get(protect, getBooking)
  .delete(protect, authorize('Tenant', 'Admin'), cancelBooking);

router.put('/:id/status', protect, authorize('Owner', 'Admin'), updateBookingStatus);
router.put('/:id/visit', protect, scheduleVisit);

module.exports = router;
