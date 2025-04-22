const alertService = require('../services/alert/alertService'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good

const alertController = {
  async createAlert(req, res, next) {
    try {
      const alertData = {
        ...req.body,
        userId: req.user.uid
      };

      const alert = await alertService.createAlert(alertData);

      res.status(201).json({
        status: 'success',
        data: { alert }
      });
    } catch (error) {
      logger.error('Error creating alert:', error);
      next(new AppError(error.message, 400));
    }
  },

  async getAlerts(req, res, next) {
    try {
      const { priority, category, status } = req.query;
      const filters = { priority, category, status };
      
      const alerts = await alertService.getActiveAlerts(req.user.uid, filters);

      res.status(200).json({
        status: 'success',
        data: { alerts }
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      next(new AppError(error.message, 400));
    }
  },

  async resolveAlert(req, res, next) {
    try {
      const { id } = req.params;
      const { resolution } = req.body;

      const resolvedAlert = await alertService.resolveAlert(id, req.user.uid, resolution);

      res.status(200).json({
        status: 'success',
        data: { alert: resolvedAlert }
      });
    } catch (error) {
      logger.error('Error resolving alert:', error);
      next(new AppError(error.message, 400));
    }
  },

  async updateAlertPreferences(req, res, next) {
    try {
      const preferences = await alertService.updatePreferences(req.user.uid, req.body);

      res.status(200).json({
        status: 'success',
        data: { preferences }
      });
    } catch (error) {
      logger.error('Error updating alert preferences:', error);
      next(new AppError(error.message, 400));
    }
  },

  async getAlertHistory(req, res, next) {
    try {
      const { startDate, endDate, type } = req.query;
      const history = await alertService.getAlertHistory(
        req.user.uid,
        { startDate, endDate, type }
      );

      res.status(200).json({
        status: 'success',
        data: { history }
      });
    } catch (error) {
      logger.error('Error fetching alert history:', error);
      next(new AppError(error.message, 400));
    }
  }
};

module.exports = alertController;