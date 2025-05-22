import { storage } from '../../../core/config/firebase'; //correct
import { formatCurrency } from '../../../shared/utils/currency'; //correct
import { logger } from '../../../shared/utils/logger'; //correct

const uploadImage = async (file) => {
  const storageRef = storage().ref(`receipts/${Date.now()}_${file.name}`);
  await storageRef.put(file);
  return await storageRef.getDownloadURL();
};

export const processReceiptImage = async file => {
  try {
    // First compress and optimize the image if needed
    const optimizedImage = await optimizeImage(file);

    // Upload to storage and get URL
    const imageUrl = await uploadImage(optimizedImage);

    // Process with OCR service
    const response = await fetch('/api/receipts/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to process receipt');
    }

    const data = await response.json();
    return parseOCRResponse(data);
  } catch (error) {
    logger.error('Error processing receipt:', error);
    throw error;
  }
};

const optimizeImage = async file => {
  try {
    // Return original file if it's already optimized
    if (file.size <= 1024 * 1024) return file;

    // Create canvas for image compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Create a promise to handle image loading
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = calculateDimensions(img, 1920); // Max width 1920px

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          blob => {
            resolve(
              new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
            );
          },
          'image/jpeg',
          0.8 // Quality setting
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    logger.error('Error optimizing image:', error);
    return file; // Return original file if optimization fails
  }
};

const calculateDimensions = (img, maxWidth) => {
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  return { width, height };
};

const parseOCRResponse = data => {
  try {
    const { text, confidence, blocks } = data;

    // Initialize receipt data
    const receiptData = {
      merchant: '',
      date: null,
      total: 0,
      items: [],
      rawText: text,
      confidence,
    };

    // Extract merchant name (usually in the first few lines)
    const lines = text.split('\n');
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 3 && !line.match(/^[\d\W]/)) {
        receiptData.merchant = line;
        break;
      }
    }

    // Extract date using common formats
    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        receiptData.date = new Date(match[0]);
        break;
      }
    }

    // Extract total amount
    const totalRegex = /tot?al\s*:?\s*[$€£]?\s*(\d+[.,]\d{2})/i;
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(totalRegex);
      if (match) {
        receiptData.total = parseFloat(match[1].replace(',', '.'));
        break;
      }
    }

    // Extract items
    const itemRegex = /([A-Za-z0-9\s&]+)\s+(?:[\d]+\s+)?[$€£]?(\d+[.,]\d{2})/;
    const currentItems = [];
    for (const line of lines) {
      const match = line.match(itemRegex);
      if (match && !line.toLowerCase().includes('total')) {
        currentItems.push({
          name: match[1].trim(),
          price: parseFloat(match[2].replace(',', '.')),
        });
      }
    }

    // Filter out likely non-items (prices too high or low)
    receiptData.items = currentItems.filter(
      item => item.price > 0 && item.price < receiptData.total * 1.5
    );

    return receiptData;
  } catch (error) {
    logger.error('Error parsing OCR response:', error);
    throw new Error('Failed to parse receipt data');
  }
};

export const validateOCRResult = data => {
  const errors = [];

  if (!data.merchant) {
    errors.push('Could not identify merchant name');
  }

  if (!data.date) {
    errors.push('Could not identify receipt date');
  }

  if (!data.total || data.total <= 0) {
    errors.push('Could not identify total amount');
  }

  if (data.items.length === 0) {
    errors.push('No items could be identified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    confidence: data.confidence,
  };
};

export const extractTotalFromText = text => {
  try {
    const lines = text.split('\n');
    const totalRegex = /tot?al\s*:?\s*[$€£]?\s*(\d+[.,]\d{2})/i;

    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(totalRegex);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }

    return null;
  } catch (error) {
    logger.error('Error extracting total:', error);
    return null;
  }
};
