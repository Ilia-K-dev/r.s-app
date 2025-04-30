// src/services/vision/visionService.js
import { storage } from '../../../core/config/firebase';
import { processImage } from '../utils/imageProcessing';

export const visionService = {
  async processReceipt(file) {
    try {
      // Process the image first
      const processedImage = await processImage(file);

      // Generate unique filename
      const filename = `receipts/${Date.now()}_${file.name}`;
      const storageRef = storage.ref(filename);

      // Upload to Firebase Storage
      await storageRef.put(processedImage);
      const imageUrl = await storageRef.getDownloadURL();

      // Get text from Vision API
      const response = await fetch('/api/vision/detect-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error('Failed to process receipt');

      const data = await response.json();
      return {
        text: data.text,
        imageUrl,
        confidence: data.confidence,
        items: data.items || [],
      };
    } catch (error) {
      console.error('Vision service error:', error);
      throw new Error('Failed to process receipt image');
    }
  },
};
