// src/features/documents/components/BaseDocumentHandler.js

import React, { useState, useRef, useCallback } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { 
  Camera, 
  Upload, 
  X, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  File as FileIcon
} from 'lucide-react';

export const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'application/pdf': ['.pdf']
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const BaseDocumentHandler = ({
  onCapture,
  onUpload,
  onProcess,
  documentType = 'document',
  allowedTypes = ACCEPTED_TYPES,
  maxSize = MAX_FILE_SIZE,
  allowCamera = true,
  showPreview = true,
  className = ''
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const validateFile = useCallback((file) => {
    if (!file) throw new Error('No file selected');
    
    if (!Object.keys(allowedTypes).includes(file.type)) {
      throw new Error(`Unsupported file type. Accepted types: ${
        Object.keys(allowedTypes).map(type => type.split('/')[1]).join(', ')
      }`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }
  }, [allowedTypes, maxSize]);

  const generatePreview = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      setLoading(true);
      validateFile(selectedFile);

      let previewUrl = null;
      if (showPreview && selectedFile.type.startsWith('image/')) {
        previewUrl = await generatePreview(selectedFile);
      }

      setFile(selectedFile);
      setPreview(previewUrl);
      setError(null);

      if (onUpload) {
        await onUpload(selectedFile);
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      setLoading(true);
      const capturedFile = await onCapture?.();
      if (capturedFile) {
        validateFile(capturedFile);
        const previewUrl = await generatePreview(capturedFile);
        setFile(capturedFile);
        setPreview(previewUrl);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
      showToast('Failed to capture image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    try {
      setLoading(true);
      await onProcess?.(file, {
        rotation,
        zoom,
        documentType
      });
      handleReset();
      showToast(`${documentType} processed successfully`, 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setRotation(0);
    setZoom(1);
    setError(null);
    setIsFullscreen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoom = (delta) => setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  const handleFullscreen = () => setIsFullscreen(prev => !prev);

  const ImagePreview = () => (
    <div className="space-y-4">
      <div className="relative">
        <div className={`
          relative overflow-hidden rounded-lg
          ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-96'}
        `}>
          <img
            src={preview}
            alt={`${documentType} preview`}
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
              onClick={handleReset}
              disabled={loading}
              title="Clear image"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleProcess}
          loading={loading}
          disabled={loading}
        >
          Process {documentType}
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
        accept={Object.keys(allowedTypes).join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={loading}
      />
      
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Take a photo or upload a {documentType}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Supported formats: {Object.keys(allowedTypes)
          .map(type => type.split('/')[1].toUpperCase())
          .join(', ')}
      </p>

      <div className="mt-4 flex justify-center gap-4">
        {allowCamera && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleCameraCapture();
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
    <Card className={`p-6 ${className}`}>
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

export default BaseDocumentHandler;