import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { 
  RotateCw, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Eye
} from 'lucide-react';

const DocumentPreview = ({
  imageUrl,
  onRotate,
  onDownload,
  onRetake,
  loading = false,
  error = null,
  title = 'Document Preview',
  className = ''
}) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    if (onRotate) {
      onRotate(rotation + 90);
    }
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  if (error) {
    return (
      <Card className={className}>
        <Alert type="error" message={error} />
      </Card>
    );
  }

  const ImageControls = () => (
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
      {onDownload && (
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onDownload}
          disabled={loading}
          title="Download image"
        />
      )}
      {onRetake && (
        <Button
          variant="secondary"
          size="sm"
          icon={X}
          onClick={onRetake}
          disabled={loading}
          title="Retake photo"
        />
      )}
    </div>
  );

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className={`
        relative
        ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'}
      `}>
        {/* Optional Title */}
        {title && !isFullscreen && (
          <div className="px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {title}
            </h3>
          </div>
        )}

        {/* Image Container */}
        <div className={`
          relative
          ${isFullscreen ? 'h-screen' : 'h-96'}
        `}>
          <img
            src={imageUrl}
            alt="Document preview"
            className={`
              w-full h-full object-contain
              transition-all duration-200
              ${isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'}
              ${loading ? 'opacity-50' : 'opacity-100'}
            `}
            style={{ 
              transform: `rotate(${rotation}deg) scale(${zoom})`,
            }}
            onClick={handleFullscreen}
          />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
            </div>
          )}

          <ImageControls />
        </div>
      </div>
    </Card>
  );
};

export default DocumentPreview;