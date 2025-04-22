const reportService = require('../services/report/reportService'); //good
const { AppError } = require('../utils/error/AppError');//good
const { validateDateRange } = require('../utils/validation/validators'); //good
const Receipt = require('../models/Receipt'); //good

const reportController = {
  async getSpendingReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400);
      }

      const report = await reportService.generateSpendingReport(
        req.user.uid,
        new Date(startDate),
        new Date(endDate)
      );

      res.status(200).json({
        status: 'success',
        data: report
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
};

module.exports = reportController;
