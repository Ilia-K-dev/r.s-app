import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/forms/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { useToast } from '@/shared/hooks/useToast';
import { useReceipts } from '../hooks/useReceipts';
import { Camera, Upload, X, Image } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic']
};

export const ReceiptUploader = ({ onSuccess, className = '' }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addReceipt } = useReceipts();
  const { showToast } = useToast();

  // Handle dropped or selected files
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        showToast(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`, 'error');
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setFile(file);
      setPreview(previewUrl);
      setError(null);
    }
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  // Handle the upload process
  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Create a basic receipt object
      const receiptData = {
        date: new Date().toISOString().split('T')[0],
        total: 0, // Will be updated by OCR
        merchant: 'Unknown', // Will be updated by OCR
        category: ''
      };

      // Upload to server for processing
      const result = await addReceipt(receiptData, file);
      
      // Show success message
      showToast('Receipt uploaded successfully', 'success');
      
      // Reset the component
      handleClear();
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      console.error('Error adding receipt:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear the selected file and preview
  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
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
            Supported formats: JPG, PNG, HEIC (max 5MB)
          </p>
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
