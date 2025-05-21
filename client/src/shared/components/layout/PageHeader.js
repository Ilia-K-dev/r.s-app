import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../shared/components/ui/Button';

const PageHeader = ({ title, subtitle, action, showBack = false, className = '', onBack }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <div>
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div>{typeof action === 'function' ? action() : action}</div>}
    </div>
  );
};

export default PageHeader;
