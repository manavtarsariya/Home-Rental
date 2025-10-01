const express = require('express');
const {
  createFeedback,
  getPropertyFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('Tenant'), createFeedback);

router.get('/my', protect, authorize('Tenant'), getMyFeedback);
router.get('/property/:propertyId', getPropertyFeedback);

router.route('/:id')
  .put(protect, authorize('Tenant'), updateFeedback)
  .delete(protect, authorize('Tenant', 'Admin'), deleteFeedback);

module.exports = router;
