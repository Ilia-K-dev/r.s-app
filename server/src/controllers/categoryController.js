const Category = require('../models/Category'); //good
const { AppError } = require('../utils/error/AppError'); //good
const { validateCategory } = require('../utils/validation/validators'); //good

const categoryController = {
  async createCategory(req, res, next) {
    try {
      const categoryData = {
        ...req.body,
        userId: req.user.uid
      };

      const category = new Category(categoryData);
      await category.save();

      res.status(201).json({
        status: 'success',
        data: category
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await Category.findByUserId(req.user.uid);
      res.status(200).json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categories = await Category.findByUserId(req.user.uid);
      const category = categories.find(c => c.id === id);

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      Object.assign(category, req.body);
      await category.save();

      res.status(200).json({
        status: 'success',
        data: category
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { db } = require('../../config/firebase');
      
      const categoryRef = db.collection('categories').doc(id);
      const doc = await categoryRef.get();

      if (!doc.exists) {
        throw new AppError('Category not found', 404);
      }

      if (doc.data().userId !== req.user.uid) {
        throw new AppError('Not authorized', 403);
      }

      await categoryRef.delete();

      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const categories = await Category.findByUserId(req.user.uid);
      const category = categories.find(c => c.id === id);

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: category
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
};

module.exports = categoryController;