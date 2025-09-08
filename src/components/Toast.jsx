import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  X,
  MessageSquare,
  Handshake
} from 'lucide-react';
import toastService from '../services/toastService';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleRemove = (id) => {
    toastService.removeToast(id);
  };

  const handleAction = (toast) => {
    if (toast.action && toast.action.onClick) {
      toast.action.onClick();
    }
    handleRemove(toast.id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative p-4 rounded-lg border-l-4 shadow-lg ${getToastStyles(toast.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getToastIcon(toast.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">
                  {toast.message}
                </p>
                
                {toast.action && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleAction(toast)}
                      className="text-xs font-medium underline hover:no-underline focus:outline-none focus:underline"
                    >
                      {toast.action.label}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleRemove(toast.id)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            {!toast.persistent && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
