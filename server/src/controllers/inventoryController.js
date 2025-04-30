const Product = require('../models/Product'); //good
const StockMovement = require('../models/StockMovement'); //good
const InventoryAlert = require('../models/InventoryAlert'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger');  //good

const inventoryController = {
  // Product Management

  /**
   * @desc Create a new inventory product
   * @route POST /api/inventory
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.body - Product data
   * @param {string} req.body.name - Product name
   * @param {number} req.body.unitPrice - Unit price of the product
   * @param {number} req.body.currentStock - Initial stock quantity
   * @param {string} req.body.category - Product category
   * @param {string} [req.body.description] - Product description (optional)
   * @param {string} [req.body.location] - Product location (optional)
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async createProduct(req, res, next) {
    try {
      const productData = {
        ...req.body,
        userId: req.user.uid
      };

      const product = new Product(productData);
      await product.save();

      res.status(201).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Update an existing inventory product
   * @route PUT /api/inventory/:id
   * @access Private (Authenticated User, Owner)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.id - Product ID
   * @param {object} req.body - Updated product data
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async updateProduct(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product || product.userId !== req.user.uid) {
        throw new AppError('Product not found', 404);
      }

      Object.assign(product, req.body);
      await product.save();

      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      logger.error('Error updating product:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Get a list of inventory products for the authenticated user
   * @route GET /api/inventory
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for filtering, sorting, and pagination
   * @param {string} [req.query.category] - Filter by category
   * @param {string} [req.query.status] - Filter by status (e.g., 'low-stock', 'out-of-stock') - Note: Stock level filtering is done client-side due to Firestore limitations
   * @param {string} [req.query.search] - Search term for product name/description
   * @param {string} [req.query.sortBy='name'] - Field to sort by
   * @param {string} [req.query.sortOrder='asc'] - Sort order ('asc' or 'desc')
   * @param {number} [req.query.limit] - Maximum number of results per page
   * @param {string} [req.query.startAfter] - Document ID to start fetching after (for cursor-based pagination)
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getProducts(req, res, next) {
    try {
      const {
        category,
        status,
        stockLevel, // Note: Stock level filtering is done client-side due to Firestore limitations
        search,
        sortBy = 'name',
        sortOrder = 'asc',
        limit,
        startAfter
      } = req.query;

      const options = {
        category,
        status,
        search, // Search is applied in the model after fetching a page
        sortBy,
        sortOrder,
        limit: limit ? parseInt(limit) : undefined,
        startAfter
      };

      const { products, lastVisible, hasNextPage } = await Product.findByUser(req.user.uid, options);

      res.status(200).json({
        status: 'success',
        data: {
          products,
          pagination: {
            lastVisible,
            hasNextPage
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching products:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Get a single inventory product by ID
   * @route GET /api/inventory/:id
   * @access Private (Authenticated User, Owner)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.id - Product ID
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getProductById(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product || product.userId !== req.user.uid) {
        throw new AppError('Product not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      logger.error('Error fetching product by ID:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Delete an inventory product by ID
   * @route DELETE /api/inventory/:id
   * @access Private (Authenticated User, Owner)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.id - Product ID
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async deleteProduct(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product || product.userId !== req.user.uid) {
        throw new AppError('Product not found', 404);
      }

      await product.delete();

      res.status(204).send(); // No content on successful deletion
    } catch (error) {
      logger.error('Error deleting product:', error);
      next(new AppError(error.message, 400));
    }
  },


  // Stock Management

  /**
   * @desc Update the stock level for an inventory item
   * @route PUT /api/inventory/:id/stock
   * @access Private (Authenticated User, Owner)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.id - Product ID
   * @param {object} req.body - Stock update data
   * @param {number} req.body.quantity - The amount to change the stock by (positive or negative)
   * @param {string} [req.body.type] - Type of stock movement (e.g., 'purchase', 'sale', 'adjustment')
   * @param {string} [req.body.reason] - Reason for the stock movement
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async updateStock(req, res, next) {
    try {
      const { quantity, type, reason } = req.body;
      const product = await Product.findById(req.params.id);
      
      if (!product || product.userId !== req.user.uid) {
        throw new AppError('Product not found', 404);
      }

      const movement = await product.updateStock(quantity, type, reason);

      res.status(200).json({
        status: 'success',
        data: { 
          product,
          movement
        }
      });
    } catch (error) {
      logger.error('Error updating stock:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Create a new stock movement record
   * @route POST /api/inventory/movements
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.body - Stock movement data
   * @param {string} req.body.itemId - ID of the inventory item related to the movement
   * @param {number} req.body.quantity - Quantity moved (positive or negative)
   * @param {string} req.body.movementType - Type of movement (e.g., 'purchase', 'sale', 'adjustment')
   * @param {timestamp} [req.body.timestamp] - Timestamp of the movement (optional, defaults to server time)
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async createStockMovement(req, res, next) {
    try {
      const movementData = {
        ...req.body,
        userId: req.user.uid
      };

      const movement = new StockMovement(movementData);
      await movement.save();

      res.status(201).json({
        status: 'success',
        data: { movement }
      });
    } catch (error) {
      logger.error('Error creating stock movement:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Get stock movement history for the authenticated user
   * @route GET /api/inventory/movements
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for filtering
   * @param {string} [req.query.startDate] - Filter movements from this date (ISO 8601)
   * @param {string} [req.query.endDate] - Filter movements up to this date (ISO 8601)
   * @param {string} [req.query.type] - Filter by movement type
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getStockMovements(req, res, next) {
    try {
      const { startDate, endDate, type } = req.query;
      const movements = await StockMovement.findByDateRange(
        req.user.uid,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );

      // Filter by type if provided
      const filteredMovements = type ?
        movements.filter(m => m.type === type) :
        movements;

      res.status(200).json({
        status: 'success',
        data: { movements: filteredMovements }
      });
    } catch (error) {
      logger.error('Error fetching stock movements:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Alert Management

  /**
   * @desc Get inventory alerts for the authenticated user
   * @route GET /api/alerts (Note: This route might be under a separate alerts API)
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for filtering
   * @param {string} [req.query.status] - Filter by alert status (e.g., 'active', 'resolved')
   * @param {string} [req.query.level] - Filter by alert level (e.g., 'critical', 'low-stock')
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getAlerts(req, res, next) {
    try {
      const { status, level } = req.query;
      let alerts;

      if (level === 'critical') {
        alerts = await InventoryAlert.findCriticalAlerts(req.user.uid);
      } else {
        alerts = await InventoryAlert.findActiveAlerts(req.user.uid);
      }

      // Filter by status if provided
      if (status) {
        alerts = alerts.filter(alert => alert.status === status);
      }

      res.status(200).json({
        status: 'success',
        data: { alerts }
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Get low stock alerts for the authenticated user
   * @route GET /api/inventory/low-stock
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getLowStockAlerts(req, res, next) {
    try {
      const alerts = await InventoryAlert.findLowStockAlerts(req.user.uid);
      res.status(200).json({
        status: 'success',
        data: { alerts }
      });
    } catch (error) {
      logger.error('Error fetching low stock alerts:', error);
      next(new AppError(error.message, 400));
    }
  },

  /**
   * @desc Resolve an inventory alert
   * @route PUT /api/alerts/:id/resolve (Note: This route might be under a separate alerts API)
   * @access Private (Authenticated User, Owner)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.id - Alert ID
   * @param {object} req.body - Resolution data
   * @param {string} [req.body.notes] - Resolution notes (optional)
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async resolveAlert(req, res, next) {
    try {
      const { notes } = req.body;
      const alert = await InventoryAlert.findById(req.params.id);

      if (!alert || alert.userId !== req.user.uid) {
        throw new AppError('Alert not found', 404);
      }

      await alert.resolve(req.user.uid, notes);

      res.status(200).json({
        status: 'success',
        data: { alert }
      });
    } catch (error) {
      logger.error('Error resolving alert:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Inventory Analysis

  /**
   * @desc Get a summary of inventory status for the authenticated user
   * @route GET /api/inventory/status (Note: This route might be under an analytics API)
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getInventoryStatus(req, res, next) {
    try {
      const products = await Product.findByUser(req.user.uid);

      const status = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0),
        lowStock: products.filter(p => p.currentStock <= p.minStockLevel).length,
        outOfStock: products.filter(p => p.currentStock === 0).length,
        needsReorder: products.filter(p => p.currentStock <= p.reorderPoint).length,
        categories: {}
      };

      // Calculate category statistics
      products.forEach(product => {
        if (!status.categories[product.category]) {
          status.categories[product.category] = {
            count: 0,
            value: 0,
            lowStock: 0
          };
        }

        const cat = status.categories[product.category];
        cat.count++;
        cat.value += product.currentStock * product.unitPrice;
        if (product.currentStock <= product.minStockLevel) {
          cat.lowStock++;
        }
      });

      res.status(200).json({
        status: 'success',
        data: { status }
      });
    } catch (error) {
      logger.error('Error getting inventory status:', error);
      next(new AppError(error.message, 400));
    }
  }
};

module.exports = inventoryController;
