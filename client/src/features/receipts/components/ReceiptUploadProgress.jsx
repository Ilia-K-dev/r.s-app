import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const ReceiptUploadProgress = ({ status, progress, message }) => {
  const stages = [
    { key: 'uploading', label: 'מעלה קובץ', icon: Loader2 },
    { key: 'processing', label: 'מעבד תמונה', icon: Loader2 },
    { key: 'extracting', label: 'מזהה טקסט', icon: Loader2 },
    { key: 'parsing', label: 'מפרק נתונים', icon: Loader2 },
    { key: 'complete', label: 'הושלם', icon: CheckCircle },
    { key: 'error', label: 'שגיאה', icon: AlertCircle }
  ];
  
  const currentStage = stages.findIndex(s => s.key === status);
  
  return (
    <div className="w-full p-6">
      <div className="relative">
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Stage indicators */}
        <div className="flex justify-between mt-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;
            const isError = status === 'error' && index === currentStage;
            
            return (
              <div 
                key={stage.key}
                className={`flex flex-col items-center ${
                  isActive ? 'text-primary-500' : 
                  isCompleted ? 'text-green-500' :
                  isError ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  isActive ? 'border-primary-500' :
                  isCompleted ? 'border-green-500' :
                  isError ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-spin' : ''}`} />
                </div>
                <span className="mt-2 text-sm font-medium">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {message && (
        <div className={`mt-4 text-center ${
          status === 'error' ? 'text-red-500' : 'text-gray-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ReceiptUploadProgress;
