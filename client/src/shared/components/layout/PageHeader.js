import { ArrowLeft } from 'lucide-react'; //correct
import React from 'react'; //correct
import { useNavigate } from 'react-router-dom'; //correct

import { Button } from '../../../shared/components/forms/Button'; //correct

const PageHeader = ({ title, subtitle, action, showBack = false, className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <div>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
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
