// src/features/documents/components/ReceiptScanner.js

import React from 'react';//correct
import { BaseDocumentHandler } from './BaseDocumentHandler';//correct
import { processReceipt } from '../utils/receiptProcessing';//correct

const RECEIPT_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic']
};

const RECEIPT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const ReceiptScanner = ({
  onScanComplete,
  loading = false,
  className = ''
}) => {
  const handleProcess = async (file, options) => {
    const processedReceipt = await processReceipt(file, options);
    await onScanComplete(processedReceipt);
  };

  return (
    <BaseDocumentHandler
      documentType="receipt"
      onProcess={handleProcess}
      allowedTypes={RECEIPT_TYPES}
      maxSize={RECEIPT_MAX_SIZE}
      allowCamera={true}
      loading={loading}
      className={className}
    />
  );
};

export default ReceiptScanner;