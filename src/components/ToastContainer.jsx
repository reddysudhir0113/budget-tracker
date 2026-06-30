import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { MdClose } from 'react-icons/md';

const ToastContainer = () => {
  const { toasts, removeToast } = useBudget();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast fade-in`}>
          <span className="toast-message">{toast.message}</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.action && (
              <button 
                className="toast-action-btn"
                onClick={() => {
                  toast.action.onClick();
                  removeToast(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}
              onClick={() => removeToast(toast.id)}
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
