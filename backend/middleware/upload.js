const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on fieldname
    if (file.fieldname === 'photos') {
      uploadPath += 'properties/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'maintenanceImages') {
      uploadPath += 'maintenance/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'photos' || file.fieldname === 'maintenanceImages' || file.fieldname === 'profileImage') {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for photos'), false);
    }
  } else if (file.fieldname === 'documents') {
    // Allow documents (PDF, DOC, DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5000000, // 5MB default
  },
  fileFilter: fileFilter
});

// Middleware for different upload types
const uploadPropertyFiles = upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'documents', maxCount: 5 }
]);

const uploadSingle = upload.single('profileImage');
const uploadMaintenanceImages = upload.array('maintenanceImages', 5);

module.exports = {
  upload,
  uploadPropertyFiles,
  uploadSingle,
  uploadMaintenanceImages
};
