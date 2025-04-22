const express = require('express');
const { authenticateUser } = require('../middleware/auth/auth'); // good
const categoryController = require('../controllers/categoryController'); // good
const validators = require('../utils/validation/validators'); // good
const { validate } = require('../middleware/validation/validation'); // good

const router = express.Router();

// Log the validators object to check its structure (for debugging)
console.log(validators);

// Destructure the categoryValidators object after logging
const { category: categoryValidators } = validators;

// Protect all routes (authentication middleware)
router.use(authenticateUser);

// Create category
router.post('/',
  categoryValidators.create, // Use the correct validation from categoryValidators
  validate, // Validate the input
  categoryController.createCategory // Handle category creation
);

// Get all categories
router.get('/',
  categoryController.getCategories // Fetch all categories
);

// Get single category by ID
router.get('/:id',
  categoryController.getCategoryById // Fetch a category by its ID
);

// Update category
router.put('/:id',
  categoryValidators.create, // Use the correct validation for category update
  validate, // Validate the input
  categoryController.updateCategory // Handle category update
);

// Delete category
router.delete('/:id',
  categoryController.deleteCategory // Handle category deletion
);

module.exports = router;
