import {
  Camera,
  Upload,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  File as FileIcon,
} from 'lucide-react';
import React, { useState, useRef, useCallback } from 'react';

import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { Card } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/hooks/useToast';
import { validateFile } from '../../../shared/utils/fileHelpers'; // Updated import

export const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'application/pdf': ['.pdf'],
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
  className = '',
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

  const handleFileSelect = async event => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      setLoading(true);
      validateFile(selectedFile); // Using the imported validateFile

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
        validateFile(capturedFile); // Using the imported validateFile
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

  // ... (rest of the component remains unchanged)

};

export default BaseDocumentHandler;
