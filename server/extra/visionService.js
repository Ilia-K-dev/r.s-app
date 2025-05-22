const vision = require('@google-cloud/vision');
const { storage } = require('../../../config/firebase'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const path = require('path');

// Initialize Google Cloud Vision Client
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

class VisionService {
  static async extractText(imageBuffer) {
    try {
      const [result] = await visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      return detections.length > 0 ? detections[0].description : '';
    } catch (error) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  static async uploadImage(imageBuffer, userId, fileName) {
    try {
      const bucket = storage.bucket();
      const timestamp = Date.now();
      const uniqueFileName = `receipts/${userId}/${timestamp}-${fileName}`;
      const file = bucket.file(uniqueFileName);

      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/jpeg',
        },
      });

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });

      return { url, path: uniqueFileName };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}

module.exports = VisionService;
