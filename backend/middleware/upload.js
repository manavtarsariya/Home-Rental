const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Single Cloudinary storage for both images and documents
const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'documents') {
      return {
        folder: 'documents',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw',
      };
    }
    // Default to images
    let folder = 'properties';
    if (file.fieldname === 'profileImage') folder = 'profiles';
    if (file.fieldname === 'maintenanceImages') folder = 'maintenance';
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      resource_type: 'image',
    };
  },
});


// File filter function
const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === 'photos' ||
    file.fieldname === 'maintenanceImages' ||
    file.fieldname === 'profileImage'
  ) {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed for photos'), false);
  } else if (file.fieldname === 'documents') {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and Word documents are allowed'), false);
  } else {
    cb(new Error('Invalid field name'), false);
  }
};


// Combined uploader for both images and documents using single storage
const uploadPropertyFiles = multer({
  storage: propertyStorage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5000000 },
}).fields([
  { name: 'photos', maxCount: 10 },
  { name: 'documents', maxCount: 5 }
]);


const uploadSingle = multer({
  storage: propertyStorage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5000000 },
}).single('profileImage');

const uploadMaintenanceImages = multer({
  storage: propertyStorage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5000000 },
}).array('maintenanceImages', 5);

module.exports = {
  uploadPropertyFiles,
  uploadSingle,
  uploadMaintenanceImages,
  cloudinary,
};
