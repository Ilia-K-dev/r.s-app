import React, { useState, useCallback } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { useToast } from '../../../shared/hooks/useToast';
import { Camera, Upload, X, Image } from 'lucide-react';
import { validateFile } from '../../receipts/utils/validation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic']
};

export const ReceiptUploader = ({ onUploadSuccess, loading = false }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const handleFileSelect = useCallback(async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      // Validate file
      const validation = validateFile(selectedFile, {
        maxSize: MAX_FILE_SIZE,
        acceptedTypes: Object.keys(ACCEPTED_TYPES)
      });

      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Set file and preview
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setError(null);

    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  }, [showToast]);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      await onUploadSuccess(formData);
      
      // Reset state after successful upload
      setFile(null);
      setPreview(null);
      showToast('Receipt uploaded successfully', 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <Card className="p-6">
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
        />
      )}

      {!file ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500"
          onClick={() => document.getElementById('receipt-upload').click()}
        >
          <input
            id="receipt-upload"
            type="file"
            accept={Object.keys(ACCEPTED_TYPES).join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Upload a receipt or take a photo
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, HEIC up to 5MB
          </p>

          <div className="mt-4 flex justify-center gap-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('receipt-upload').click();
              }}
              icon={Camera}
              disabled={loading}
            >
              Take Photo
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('receipt-upload').click();
              }}
              icon={Upload}
              disabled={loading}
            >
              Upload File
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full rounded-lg"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={X}
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

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