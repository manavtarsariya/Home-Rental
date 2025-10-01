const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllProperties,
  updatePropertyStatus,
  getAllBookings,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and only for admins
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getDashboardStats);

// User management
router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/status', updateUserStatus);

// Property management
router.get('/properties', getAllProperties);
router.put('/properties/:id/status', updatePropertyStatus);

// Booking management
router.get('/bookings', getAllBookings);

module.exports = router;
