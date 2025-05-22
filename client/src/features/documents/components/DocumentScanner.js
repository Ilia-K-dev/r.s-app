import React, { useState, useCallback, useRef } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { useToast } from '../../../shared/hooks/useToast';
import {
  Camera,
  Upload,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize
} from 'lucide-react';
import { processImage } from '../utils/imageProcessing'; // Corrected import path

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DocumentScanner = ({
  onScanComplete,
  loading = false,
  maxFileSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_TYPES,
  allowCamera = true,
  initialInstructions = 'Take a photo or upload a document'
}) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const validateFile = (file) => {
    if (!file) throw new Error('No file selected');

    if (!Object.keys(acceptedTypes).includes(file.type)) {
      throw new Error(`Unsupported file type. Accepted types: ${Object.keys(acceptedTypes).map(type => type.split('/')[1]).join(', ')}`);
    }

    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
    }
  };

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImage(file);
      setPreview(previewUrl);
      setRotation(0);
      setZoom(1);
      setError(null);

    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [showToast, maxFileSize, acceptedTypes]); // Added acceptedTypes to dependencies

  const handleProcess = async () => {
    if (!image) return;

    try {
      // Process image with current transformations
      const processedImage = await processImage(image, {
        rotation,
        zoom,
        quality: 0.8
      });

      await onScanComplete(processedImage);

      handleClear();
      showToast('Document processed successfully', 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImage(null);
    setPreview(null);
    setRotation(0);
    setZoom(1);
    setError(null);
    setIsFullscreen(false);
  };

  const ImagePreview = () => (
    <div className="space-y-4">
      <div className="relative">
        <div className={`
          relative overflow-hidden rounded-lg
          ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-96'}
        `}>
          <img
            src={preview}
            alt="Document preview"
            className="w-full h-full object-contain transition-all duration-200"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              cursor: isFullscreen ? 'zoom-out' : 'zoom-in'
            }}
            onClick={handleFullscreen}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCw}
              onClick={handleRotate}
              disabled={loading}
              title="Rotate image"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={ZoomIn}
              onClick={() => handleZoom(0.25)}
              disabled={loading || zoom >= 3}
              title="Zoom in"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={ZoomOut}
              onClick={() => handleZoom(-0.25)}
              disabled={loading || zoom <= 0.5}
              title="Zoom out"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={isFullscreen ? Minimize : Maximize}
              onClick={handleFullscreen}
              disabled={loading}
              title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={X}
              onClick={handleClear}
              disabled={loading}
              title="Clear image"
            />
          </div>
        </div>
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
          onClick={handleProcess}
          loading={loading}
          disabled={loading}
        >
          Process Document
        </Button>
      </div>
    </div>
  );

  const UploadInterface = () => (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors duration-200"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={Object.keys(acceptedTypes).join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={loading}
      />

      <Camera className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {initialInstructions}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Supported formats: {Object.keys(acceptedTypes)
          .map(type => type.split('/')[1].toUpperCase())
          .join(', ')}
      </p>

      <div className="mt-4 flex justify-center gap-4">
        {allowCamera && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('camera-input')?.click();
            }}
            icon={Camera}
            disabled={loading}
          >
            Take Photo
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          icon={Upload}
          disabled={loading}
        >
          Upload
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
        />
      )}

      {preview ? <ImagePreview /> : <UploadInterface />}
    </Card>
  );
};

export default DocumentScanner;
