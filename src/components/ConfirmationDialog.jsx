import React from 'react';
import Modal from './Modal';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to perform this action? This cannot be undone." }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button className="clay-button secondary clay-button-pill" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="clay-button expense clay-button-pill" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
