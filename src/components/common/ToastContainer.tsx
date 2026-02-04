import { useEffect } from 'react';

/**
 * ToastContainer component
 * This component ensures the toast container is properly initialized in the DOM
 * Add this component once at the root of your app
 */
const ToastContainer = () => {
  useEffect(() => {
    // Ensure toast styles are added
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        #toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

    // Ensure toast container exists
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  }, []);

  return null;
};

export default ToastContainer;
