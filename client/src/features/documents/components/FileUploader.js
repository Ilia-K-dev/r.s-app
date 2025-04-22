import React, { useCallback } from 'react';//correct
import { Upload, File, X } from 'lucide-react';//correct

export const FileUploader = ({ 
  onFileSelect, 
  acceptedTypes = 'image/*',
  maxSize = 5242880, // 5MB
  multiple = false 
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndSetFiles(droppedFiles);
  }, []);

  const validateAndSetFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize/1024/1024}MB`);
        return false;
      }
      if (!file.type.match(acceptedTypes)) {
        setError(`File ${file.name} is not a supported format`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    onFileSelect(multiple ? validFiles : validFiles[0]);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-300"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your files here, or{' '}
          <button className="text-primary-500 hover:text-primary-600">
            browse
          </button>
        </p>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li 
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center">
                <File className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== index));
                  setError('');
                }}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};