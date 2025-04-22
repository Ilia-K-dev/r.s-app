// src/features/receipts/components/ReceiptUploader.js

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { useToast } from '../../../shared/hooks/useToast';
import { Camera, Upload, X, Image } from 'lucide-react';
import { 
  validateFile, 
  createFilePreview, 
  revokeFilePreview, 
  formatFileSize 
} from '../../../shared/utils/fileHelpers';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic']
};

export const ReceiptUploader = ({ 
  onUploadSuccess, 
  loading = false,
  allowCamera = true,
  className = ''
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileSelection(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  const handleFileSelection = async (selectedFile) => {
    try {
      // Validate file
      const validation = validateFile(selectedFile, {
        maxSize: MAX_FILE_SIZE,
        acceptedTypes: Object.keys(ACCEPTED_TYPES)
      });

      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Create preview
      const previewUrl = createFilePreview(selectedFile);
      if (!previewUrl) {
        throw new Error('Failed to create file preview');
      }

      setFile(selectedFile);
      setPreview(previewUrl);
      setError(null);

    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      await onUploadSuccess(formData);
      
      showToast('Receipt uploaded successfully', 'success');
      handleClear();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleClear = () => {
    if (preview) {
      revokeFilePreview(preview);
    }
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <Card className={`p-6 ${className}`}>
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
        />
      )}

      {!file ? (
        <div {...getRootProps()} className={`
          border-2 border-dashed rounded-lg p-6 text-center 
          transition-colors duration-200 cursor-pointer
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        `}>
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? 'Drop the receipt here...' : 'Drop a receipt or click to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, HEIC (max {formatFileSize(MAX_FILE_SIZE)})
          </p>

          {allowCamera && (
            <div className="mt-4 flex justify-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // Camera handling logic
                }}
                icon={Camera}
                disabled={loading}
              >
                Take Photo
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => e.stopPropagation()}
                icon={Upload}
                disabled={loading}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full rounded-lg"
            />
            <Button
              className="absolute top-2 right-2"
              variant="secondary"
              size="sm"
              icon={X}
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              loading={loading}
              disabled={loading}
              icon={Upload}
            >
              Upload Receipt
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReceiptUploader;