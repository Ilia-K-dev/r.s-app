// src/features/documents/components/DocumentScanner.js

import React from 'react'; //correct

import { processImage } from '../utils/imageProcessing'; //correct

import { BaseDocumentHandler, ACCEPTED_TYPES, MAX_FILE_SIZE } from './BaseDocumentHandler'; //correct

export const DocumentScanner = ({
  onScanComplete,
  loading = false,
  allowedTypes = ACCEPTED_TYPES,
  maxFileSize = MAX_FILE_SIZE,
  allowCamera = true,
  documentType = 'document',
  className = '',
}) => {
  const handleProcess = async (file, options) => {
    const processedImage = await processImage(file, options);
    await onScanComplete(processedImage);
  };

  return (
    <BaseDocumentHandler
      documentType={documentType}
      onProcess={handleProcess}
      allowedTypes={allowedTypes}
      maxSize={maxFileSize}
      allowCamera={allowCamera}
      loading={loading}
      className={className}
    />
  );
};

export default DocumentScanner;
