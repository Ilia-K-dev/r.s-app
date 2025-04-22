import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../components/common/Card'; // Updated import path
import { Button } from '../components/common/Button'; // Updated import path
import { Alert } from '../components/common/Alert'; // Updated import path
import { Upload, X, Image, FileText } from 'lucide-react';
import { validateFile } from '../src/features/documents/utils/validation'; // Assuming this utility is still in the same location

const ReceiptUpload = ({ 
  onUpload,
  loading = false,
  error = null,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/heic': ['.heic']
  }
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file && !loading) {
      const formData = new FormData();
      formData.append('receipt', file);
      await onUpload(formData);
      // Reset after successful upload
      setFile(null);
      setPreview(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="space-y-4">
            {error && (
              <Alert type="error" message={error} />
            )}

            {!file ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center 
                  transition-colors duration-200 cursor-pointer
                  ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {isDragActive
                    ? 'Drop the receipt here...'
                    : 'Drag and drop a receipt, or click to select'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Supported formats: JPG, PNG, HEIC (max {maxSize / (1024 * 1024)}MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={X}
                    onClick={handleClear}
                  />
                </div>
                {preview ? (
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-h-96 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="p-4 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">{file.name}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="px-4 py-3 bg-gray-50 text-right border-t">
            <Button
              type="submit"
              loading={loading}
              disabled={!file || loading}
              icon={Upload}
            >
              Upload Receipt
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

export default ReceiptUpload;
