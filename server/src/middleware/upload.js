const multer = require('multer');
const { AppError } = require('../utils/error/AppError'); //good
const path = require('path');

// Configure storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images.', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};