const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  searchProperties
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPropertyFiles } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, authorize('Owner', 'Admin'), uploadPropertyFiles, createProperty);

router.get('/search', searchProperties);
router.get('/owner/me', protect, authorize('Owner', 'Admin'), getOwnerProperties);

router.route('/:id')
  .get(getProperty)
  .put(protect, authorize('Owner', 'Admin'), updateProperty)
  .delete(protect, authorize('Owner', 'Admin'), deleteProperty);

module.exports = router;
