const exportService = require('../services/export/exportService'); // Assuming an export service exists
const { AppError } = require('../utils/error/AppError');
const logger = require('../utils/logger');

const exportController = {
  /**
   * @desc Handles requests to generate a data export file.
   * @route POST /api/exports
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.body - Export request data
   * @param {string} req.body.reportType - Type of report ('receipts' or 'inventory')
   * @param {string} req.body.format - Export format ('csv', 'pdf', or 'json')
   * @param {object} [req.body.filters] - Optional filters for the report data (e.g., date range, category)
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async generateExport(req, res, next) {
    try {
      const userId = req.user.uid;
      const { reportType, format, filters } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }
      if (!reportType || !format) {
        throw new AppError('Report type and format are required.', 400);
      }

      logger.info(`Received export generation request for user ${userId}, type: ${reportType}, format: ${format}`);

      // Call service to generate and store the export file
      const { downloadUrl, exportId } = await exportService.generateAndStoreExport(userId, reportType, format, filters);

      res.status(200).json({
        status: 'success',
        message: 'Export generation initiated.',
        exportId: exportId,
        downloadUrl: downloadUrl // Provide download URL directly for immediate download
      });

    } catch (error) {
      logger.error(`Error generating export for user ${req.user?.uid}: ${error.message}`, { stack: error.stack, name: error.name });
      next(error instanceof AppError ? error : new AppError('Failed to generate export.', 500));
    }
  },

  /**
   * @desc Handles requests to download a previously generated export file.
   * @route GET /api/exports/:id
   * @access Private (Authenticated User, Owner)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.id - The ID of the export record in Firestore.
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async downloadExport(req, res, next) {
    try {
      const userId = req.user.uid;
      const exportId = req.params.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }
      if (!exportId) {
        throw new AppError('Export ID is required for download.', 400);
      }

      logger.info(`Received export download request for user ${userId}, export ID: ${exportId}`);

      // Call service to get the download stream or URL
      const { stream, filename, mimeType } = await exportService.getExportFile(exportId, userId);

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', mimeType);

      // Pipe the file stream to the response
      stream.pipe(res);

    } catch (error) {
      logger.error(`Error downloading export ${req.params?.id} for user ${req.user?.uid}: ${error.message}`, { stack: error.stack, name: error.name });
      next(error instanceof AppError ? error : new AppError('Failed to download export.', 500));
    }
  }
};

module.exports = exportController;
