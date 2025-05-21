// src/features/documents/components/DocumentPreview.js

import { Download, Maximize, Minimize, RotateCw, Edit, Trash, Eye, ZoomIn, ZoomOut, X } from 'lucide-react'; //correct
import React, { useState } from 'react'; //correct

import { Button } from '../../../shared/components/forms/Button'; //correct
import { Alert } from '../../../shared/components/ui/Alert'; //correct
import { Card } from '../../../shared/components/ui/Card'; //correct
import { Loading } from '../../../shared/components/ui/Loading'; //correct
import { formatDate, formatFileSize } from '../../../utils/formatters'; // Assuming formatters are available

export const DocumentPreview = ({
  document,
  imageUrl,
  onEdit,
  onDelete,
  onDownload,
  onRetake, // Added onRetake prop
  loading = false,
  error = null,
  showMetadata = true,
  className = '',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1); // Added zoom state

  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleZoom = (delta) => { // Added handleZoom function
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };


  if (loading) {
    return (
      <Card className={`flex items-center justify-center p-8 ${className}`}>
        <Loading size="lg" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <Alert type="error" message={error} />
      </Card>
    );
  }

  const ImageActions = () => ( // Extracted ImageActions for clarity
    <div className="absolute top-2 right-2 flex space-x-2">
      <Button
        variant="secondary"
        size="sm"
        icon={isFullscreen ? Minimize : Maximize}
        onClick={handleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
      />
      <Button variant="secondary" size="sm" icon={RotateCw} onClick={handleRotate} title="Rotate image" />
       <Button // Added Zoom In button
        variant="secondary"
        size="sm"
        icon={ZoomIn}
        onClick={() => handleZoom(0.25)}
        disabled={loading || zoom >= 3}
        title="Zoom in"
      />
      <Button // Added Zoom Out button
        variant="secondary"
        size="sm"
        icon={ZoomOut}
        onClick={() => handleZoom(-0.25)}
        disabled={loading || zoom <= 0.5}
        title="Zoom out"
      />
      {onDownload && (
        <Button variant="secondary" size="sm" icon={Download} onClick={onDownload} title="Download image" />
      )}
       {onRetake && ( // Added Retake button
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
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        {imageUrl ? (
          <div
            className={`
            relative
            ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-96'}
          `}
          >
            <img
              src={imageUrl}
              alt="Document preview"
              className={`
                w-full h-full object-contain
                transition-transform duration-200
                ${isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'}
              `}
              style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }} // Applied zoom
              onClick={handleFullscreen}
            />
             <ImageActions /> {/* Used ImageActions component */}
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>

      {showMetadata && document && (
        <div className="p-4 border-t">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{document.title || document.fileName}</h3>
              {document.date && (
                <p className="text-sm text-gray-500">{formatDate(document.date)}</p>
              )}
              {document.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                  {document.category}
                </span>
              )}
            </div>
            {document.metadata && (
              <div className="text-sm text-gray-500">
                <p>Type: {document.metadata.type}</p>
                {document.metadata.size && <p>Size: {formatFileSize(document.metadata.size)}</p>}
              </div>
            )}
          </div>

          {/* Document Actions */}
          {(onEdit || onDelete) && (
            <div className="mt-4 flex justify-end space-x-2">
              {onEdit && (
                <Button variant="secondary" size="sm" icon={Edit} onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="danger" size="sm" icon={Trash} onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DocumentPreview;
