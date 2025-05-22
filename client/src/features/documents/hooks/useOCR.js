import { useState } from 'react';

import { processDocument } from '../services/documentProcessingService'; //correct
import { validateFile } from '../../../shared/utils/fileHelpers'; // Updated import

export const useOCR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processReceipt = async (file, userId) => {
    try {
      setLoading(true);
      setError(null);

      const processedReceipt = await processDocument(file, userId);
      return processedReceipt;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processReceipt,
  };
};
