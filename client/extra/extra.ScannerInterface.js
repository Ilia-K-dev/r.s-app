import React, { useRef, useState } from 'react';
import { Card } from '../src/shared/components/ui/Card'; // Updated import path
import { Button } from '../src/shared/components/forms/Button'; // Updated import path
import { Camera, Upload } from 'lucide-react'; // Updated import path
import { useToast } from '../src/shared/hooks/useToast'; // Updated import path

const ScannerInterface = ({ onCapture, onUpload }) => {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    try {
      setLoading(true);
      await onUpload(file);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button
            onClick={() => onCapture()}
            icon={Camera}
            disabled={loading}
          >
            Take Photo
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            icon={Upload}
            disabled={loading}
          >
            Upload
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </Card>
  );
};

export default ScannerInterface;
