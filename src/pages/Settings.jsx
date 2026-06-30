import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  MdOutlineSettings, 
  MdOutlineFileUpload, 
  MdOutlineFileDownload, 
  MdOutlineRefresh,
  MdOutlineDarkMode,
  MdOutlineLightMode
} from 'react-icons/md';

const Settings = () => {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    resetAllData,
    addToast
  } = useBudget();

  const [userName, setUserName] = useState(settings.userName);
  const [currency, setCurrency] = useState(settings.currency);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    updateSettings({ userName, currency });
  };

  const handleImportFile = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      const success = importData(event.target.result);
      if (success) {
        // Reset file input
        e.target.value = null;
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '24px' }}>System Settings</h2>
        <p className="page-subtitle">Configure your profile, currency choices, theme settings and local backups.</p>
      </div>

      <div className="settings-layout-grid">
        {/* Left Side: General Profile & Theme Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile Form */}
          <div className="clay-card">
            <div className="flex-row" style={{ gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <MdOutlineSettings size={22} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px' }}>Profile Configurations</h3>
            </div>

            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="set-name">Greeting Name</label>
                <input
                  id="set-name"
                  type="text"
                  className="clay-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-currency">Active Currency Symbol</label>
                <select
                  id="set-currency"
                  className="clay-input clay-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="₹">₹ (INR - Rupee)</option>
                  <option value="$">$ (USD - Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - Pound)</option>
                  <option value="¥">¥ (JPY - Yen)</option>
                </select>
              </div>

              <button type="submit" className="clay-button primary" style={{ alignSelf: 'flex-start' }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Theme card */}
          <div className="clay-card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Visual Theme</h3>
            <div className="flex-between" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: '16px', 
              padding: '16px 20px',
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div className="flex-row" style={{ gap: '12px' }}>
                {settings.theme === 'light' ? (
                  <MdOutlineLightMode size={24} style={{ color: 'var(--primary)' }} />
                ) : (
                  <MdOutlineDarkMode size={24} style={{ color: 'var(--primary)' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '14px' }}>Dark Theme Override</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Toggle the interface color scheme</p>
                </div>
              </div>

              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.theme === 'dark'} 
                  onChange={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Backups and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Backups Panel */}
          <div className="clay-card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Backup & Restore</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Your transactions ledger, people list, custom categories and budgets are fully stored inside your browser's local storage. Export them to create a backup file.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="clay-button secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={exportData}>
                <MdOutlineFileUpload size={18} /> Export Data (.json)
              </button>

              <div style={{ position: 'relative', width: '100%' }}>
                <label className="clay-button primary" style={{ width: '100%', cursor: 'pointer', justifyContent: 'center' }}>
                  <MdOutlineFileDownload size={18} /> Import Data (.json)
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImportFile}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Reset Panel */}
          <div className="clay-card" style={{ border: '1px solid var(--expense-light)' }}>
            <h3 style={{ fontSize: '15px', color: 'var(--expense)', marginBottom: '12px' }}>Danger Zone</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Resetting all data will erase any custom entries and restore the initial mock statistics matching July 2026 data. This action is final.
            </p>

            <button className="clay-button expense" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setResetConfirmOpen(true)}>
              <MdOutlineRefresh size={18} /> Reset Database
            </button>
          </div>
        </div>
      </div>

      {/* Database Reset Confirmation */}
      <ConfirmationDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset All Data"
        message="Are you sure you want to restore the entire budget tracker database to default states? This will permanently delete your custom transactions, categories, and people logs."
        onConfirm={resetAllData}
      />
    </div>
  );
};

export default Settings;
