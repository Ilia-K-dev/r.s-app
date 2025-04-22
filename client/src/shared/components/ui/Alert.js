import React from 'react';//correct
import { XCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';//correct

export const Alert = ({ 
  type = 'info', 
  title, 
  message,
  onClose 
}) => {
  const types = {
    success: {
      icon: CheckCircle,
      classes: 'bg-green-50 text-green-800 border-green-200'
    },
    error: {
      icon: XCircle,
      classes: 'bg-red-50 text-red-800 border-red-200'
    },
    warning: {
      icon: AlertTriangle,
      classes: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    },
    info: {
      icon: Info,
      classes: 'bg-blue-50 text-blue-800 border-blue-200'
    }
  };

  const { icon: Icon, classes } = types[type];

  return (
    <div className={`p-4 rounded-lg border ${classes}`}>
      <div className="flex">
        <Icon className="h-5 w-5 mr-3" />
        <div className="flex-1">
          {title && <h3 className="font-medium">{title}</h3>}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

Alert.defaultProps = {
  type: 'info'
};