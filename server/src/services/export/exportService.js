const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../../utils/error/AppError');
const logger = require('../../utils/logger');
const { Parser } = require('json2csv'); // Assuming json2csv library is available
const PDFDocument = require('pdfkit'); // Assuming pdfkit library is available
const { Readable } = require('stream');

const db = getFirestore();
const bucket = getStorage().bucket(); // Default bucket

class ExportService {
  /**
   * @desc Generates and stores a data export file in Firebase Storage.
   * @param {string} userId - The authenticated user's ID.
   * @param {string} reportType - The type of report to export ('receipts' or 'inventory').
   * @param {string} format - The export format ('csv', 'pdf', or 'json').
   * @param {object} [filters] - Optional filters to apply to the data.
   * @returns {Promise<{downloadUrl: string, exportId: string}>} - The download URL and export ID.
   * @throws {AppError} - If generation or storage fails.
   */
  async generateAndStoreExport(userId, reportType, format, filters = {}) {
    if (!userId) throw new AppError('User ID is required.', 400);
    if (!reportType || !['receipts', 'inventory'].includes(reportType)) throw new AppError('Invalid report type.', 400);
    if (!format || !['csv', 'pdf', 'json'].includes(format)) throw new AppError('Invalid export format.', 400);

    logger.info(`Generating ${reportType} export in ${format} format for user ${userId}`);

    try {
      // 1. Fetch data based on report type and filters
      let data;
      if (reportType === 'receipts') {
        data = await this._fetchReceiptData(userId, filters);
      } else if (reportType === 'inventory') {
        data = await this._fetchInventoryData(userId, filters);
      }

      if (!data || data.length === 0) {
          throw new AppError(`No ${reportType} data found for the specified filters.`, 404);
      }

      // 2. Format data based on the requested format
      let formattedData;
      let mimeType;
      let fileExtension;

      switch (format) {
        case 'csv':
          formattedData = this._formatAsCsv(data);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'pdf':
          formattedData = await this._formatAsPdf(reportType, data); // PDF requires async generation
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
          break;
        case 'json':
          formattedData = this._formatAsJson(data);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        default:
          throw new AppError('Unsupported export format.', 400);
      }

      // 3. Store the formatted data in Firebase Storage
      const exportId = uuidv4();
      const filename = `${reportType}-export-${exportId}.${fileExtension}`;
      const filePath = `exports/${userId}/${filename}`;
      const fileUpload = bucket.file(filePath);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: mimeType,
          metadata: { userId, reportType, format, exportId, timestamp: Date.now().toString() }
        },
      });

      await new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          logger.error(`GCS upload stream error for export ${filePath}: ${err.message}`, { stack: err.stack });
          reject(new AppError('Failed to upload export file to storage.', 500));
        });
        stream.on('finish', () => {
          logger.info(`GCS upload finished successfully for export ${filePath}`);
          resolve();
        });

        if (format === 'pdf') {
             // For PDF, formattedData is a PDFDocument stream, pipe it directly
             formattedData.pipe(stream);
             formattedData.end(); // End the PDF stream
        } else {
            // For CSV and JSON, formattedData is a string, write it to the stream
            stream.end(formattedData);
        }
      });

      // 4. Generate a signed URL for download
      const signedUrlConfig = { action: 'read', expires: '01-01-2500' }; // Long expiry for generated exports
      const [signedUrl] = await fileUpload.getSignedUrl(signedUrlConfig);

      // Optionally save export metadata to Firestore (e.g., exportId, userId, filename, timestamp, status)
      await db.collection('exports').doc(exportId).set({
          userId,
          filename,
          filePath,
          format,
          reportType,
          createdAt: new Date(),
          status: 'completed',
          // downloadUrl: signedUrl // Could store URL if needed, but generating on the fly is safer
      });


      logger.info(`Export generated and stored: ${filePath}`);
      return { downloadUrl: signedUrl, exportId: exportId };

    } catch (error) {
      logger.error(`Failed to generate and store export for user ${userId}: ${error.message}`, { stack: error.stack });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Server error during export generation.', 500);
    }
  }

  /**
   * @desc Gets a readable stream for a previously generated export file from Firebase Storage.
   * @param {string} exportId - The ID of the export file.
   * @param {string} userId - The authenticated user's ID (for ownership verification).
   * @returns {Promise<{stream: Readable, filename: string, mimeType: string}>} - The file stream, filename, and mime type.
   * @throws {AppError} - If the export is not found or not owned by the user.
   */
  async getExportFile(exportId, userId) {
    if (!exportId || !userId) throw new AppError('Export ID and User ID are required.', 400);

    logger.info(`Attempting to retrieve export file ${exportId} for user ${userId}`);

    try {
      // 1. Verify export existence and ownership from Firestore metadata
      const exportDoc = await db.collection('exports').doc(exportId).get();
      if (!exportDoc.exists) {
        throw new AppError('Export file not found.', 404);
      }
      const exportData = exportDoc.data();

      if (exportData.userId !== userId) {
        throw new AppError('Unauthorized: You do not have permission to download this file.', 403);
      }

      const filePath = exportData.filePath;
      const filename = exportData.filename;
      const mimeType = exportData.format === 'csv' ? 'text/csv' :
                       exportData.format === 'pdf' ? 'application/pdf' :
                       exportData.format === 'json' ? 'application/json' : 'application/octet-stream'; // Default mime type

      // 2. Get the file from Firebase Storage
      const file = bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        // If metadata exists but file is gone, update status?
        throw new AppError('Export file not found in storage.', 404);
      }

      // 3. Return a readable stream
      const stream = file.createReadStream();

      logger.info(`Successfully retrieved export file stream for ${exportId}`);
      return { stream, filename, mimeType };

    } catch (error) {
      logger.error(`Failed to retrieve export file ${exportId} for user ${userId}: ${error.message}`, { stack: error.stack });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Server error during export retrieval.', 500);
    }
  }


  // Private helper methods for data fetching and formatting

  /**
   * @desc Fetches receipt data for export based on user ID and filters.
   * @param {string} userId - The authenticated user's ID.
   * @param {object} [filters] - Filters to apply (e.g., startDate, endDate, category).
   * @returns {Promise<Array<object>>} - Array of receipt data.
   */
  async _fetchReceiptData(userId, filters) {
      logger.info(`Fetching receipt data for user ${userId} with filters: ${JSON.stringify(filters)}`);
      let query = db.collection('receipts').where('userId', '==', userId);

      // Apply date range filter if provided
      if (filters.startDate) {
          query = query.where('date', '>=', new Date(filters.startDate));
      }
      if (filters.endDate) {
          query = query.where('date', '<=', new Date(filters.endDate));
      }
      // Add other receipt-specific filters here (e.g., category, vendor)
      if (filters.category) {
           // Assuming category is stored in classification.metadata.category.value
           query = query.where('classification.metadata.category.value', '==', filters.category);
      }


      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * @desc Fetches inventory data for export based on user ID and filters.
   * @param {string} userId - The authenticated user's ID.
   * @param {object} [filters] - Filters to apply (e.g., category, stock level).
   * @returns {Promise<Array<object>>} - Array of inventory data.
   */
  async _fetchInventoryData(userId, filters) {
      logger.info(`Fetching inventory data for user ${userId} with filters: ${JSON.stringify(filters)}`);
      let query = db.collection('products').where('userId', '==', userId);

      // Add inventory-specific filters here (e.g., category, stock level)
      if (filters.category) {
          query = query.where('category', '==', filters.category);
      }
      // Note: Stock level filtering is complex in Firestore, might need client-side filtering or different approach


      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * @desc Formats data as a CSV string.
   * @param {Array<object>} data - The data to format.
   * @returns {string} - The data formatted as CSV.
   * @throws {AppError} - If formatting fails.
   */
  _formatAsCsv(data) {
      logger.info('Formatting data as CSV.');
      if (!data || data.length === 0) return '';

      try {
          const parser = new Parser();
          return parser.parse(data);
      } catch (error) {
          logger.error('Error formatting data as CSV:', error);
          throw new AppError('Failed to format data as CSV.', 500);
      }
  }

  /**
   * @desc Formats data as a PDF stream.
   * @param {string} reportType - The type of report ('receipts' or 'inventory').
   * @param {Array<object>} data - The data to format.
   * @returns {Promise<Readable>} - A promise that resolves with a readable PDF stream.
   * @throws {AppError} - If formatting fails.
   */
  async _formatAsPdf(reportType, data) {
      logger.info('Formatting data as PDF.');
      return new Promise((resolve, reject) => {
          const doc = new PDFDocument();
          const stream = new Readable();
          stream._read = () => {}; // Required for Readable stream

          doc.on('data', (chunk) => stream.push(chunk));
          doc.on('end', () => { stream.push(null); resolve(stream); });
          doc.on('error', (err) => { logger.error('PDF generation error:', err); reject(new AppError('Failed to format data as PDF.', 500)); });

          doc.fontSize(18).text(`${reportType.toUpperCase()} Export`, { align: 'center' }).moveDown();

          if (reportType === 'receipts') {
              data.forEach(receipt => {
                  doc.fontSize(12).text(`Receipt ID: ${receipt.id}`).moveDown(0.5);
                  doc.text(`Date: ${receipt.date?.toDate().toLocaleDateString() || 'N/A'}`).moveDown(0.5);
                  doc.text(`Total: ${receipt.total || 'N/A'}`).moveDown(0.5);
                  doc.text(`Vendor: ${receipt.vendor?.name || 'N/A'}`).moveDown(1);
                  // Add more receipt details as needed
              });
          } else if (reportType === 'inventory') {
               data.forEach(item => {
                   doc.fontSize(12).text(`Product Name: ${item.name}`).moveDown(0.5);
                   doc.text(`Category: ${item.category || 'N/A'}`).moveDown(0.5);
                   doc.text(`Current Stock: ${item.currentStock || 0}`).moveDown(0.5);
                   doc.text(`Unit Price: ${item.unitPrice || 'N/A'}`).moveDown(1);
                   // Add more inventory item details as needed
               });
          }


          doc.end();
      });
  }

  /**
   * @desc Formats data as a JSON string.
   * @param {Array<object>} data - The data to format.
   * @returns {string} - The data formatted as JSON.
   * @throws {AppError} - If formatting fails.
   */
  _formatAsJson(data) {
      logger.info('Formatting data as JSON.');
      try {
          return JSON.stringify(data, null, 2);
      } catch (error) {
          logger.error('Error formatting data as JSON:', error);
          throw new AppError('Failed to format data as JSON.', 500);
      }
  }
}

module.exports = new ExportService();
