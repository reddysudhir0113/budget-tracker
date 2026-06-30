import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { 
  MdOutlineDashboard, 
  MdOutlineCompareArrows, 
  MdOutlineCategory, 
  MdOutlinePeopleAlt, 
  MdOutlineAssessment, 
  MdOutlineTrackChanges, 
  MdOutlineSettings, 
  MdOutlineAccountBalanceWallet,
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdArrowDropUp,
  MdOutlineCalendarToday
} from 'react-icons/md';

const Sidebar = () => {
  const { currentMonth, setCurrentMonth, settings, toggleTheme } = useBudget();
  const [showMonthSelect, setShowMonthSelect] = useState(false);

  const months = ['2026-06', '2026-07', '2026-08', '2026-09'];

  const formatMonth = (mStr) => {
    const [year, month] = mStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: MdOutlineDashboard },
    { path: '/transactions', label: 'Transactions', icon: MdOutlineCompareArrows },
    { path: '/categories', label: 'Categories', icon: MdOutlineCategory },
    { path: '/people', label: 'People', icon: MdOutlinePeopleAlt },
    { path: '/reports', label: 'Reports', icon: MdOutlineAssessment },
    { path: '/goals', label: 'Goals', icon: MdOutlineTrackChanges },
    { path: '/settings', label: 'Settings', icon: MdOutlineSettings }
  ];

  return (
    <aside className="sidebar">
      <div>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-container">
            <div className="logo-icon-clay">
              <MdOutlineAccountBalanceWallet />
            </div>
            <div className="logo-text">
              <h2>Budget</h2>
              <span>Tracker</span>
            </div>
          </div>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-item-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        {/* Piggy Bank Card */}
        <div className="piggy-bank-card">
          <div className="piggy-image-container" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={`${import.meta.env.BASE_URL}clay_piggy_bank.png`} alt="Piggy Bank" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h4>Save Better</h4>
          <p>Track your expenses and save more every month.</p>
          <Link to="/goals" className="clay-button primary clay-button-pill" style={{ textDecoration: 'none', width: '100%' }}>
            Set Goal
          </Link>
        </div>

        {/* Month Selector */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
          <button 
            className="clay-button secondary" 
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px' }}
            onClick={() => setShowMonthSelect(!showMonthSelect)}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MdOutlineCalendarToday size={14} style={{ color: 'var(--primary)' }} />
              {formatMonth(currentMonth)}
            </span>
            <MdArrowDropUp size={20} style={{ transform: showMonthSelect ? 'rotate(180deg)' : 'none', transition: 'var(--transition-smooth)' }} />
          </button>
          
          {showMonthSelect && (
            <div className="clay-card" style={{ 
              position: 'absolute', 
              bottom: '100%', 
              left: 0, 
              right: 0, 
              marginBottom: '8px', 
              padding: '8px',
              borderRadius: '16px',
              zIndex: 110,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--clay-shadow-card)'
            }}>
              {months.map((m) => (
                <button
                  key={m}
                  className={`clay-button ${currentMonth === m ? 'primary' : 'secondary'} clay-button-pill`}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  onClick={() => {
                    setCurrentMonth(m);
                    setShowMonthSelect(false);
                  }}
                >
                  {formatMonth(m)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <div className="theme-switch-container">
          <span className="theme-switch-label">
            {settings.theme === 'light' ? (
              <>
                <MdOutlineLightMode style={{ color: 'var(--primary)' }} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <MdOutlineDarkMode style={{ color: 'var(--primary)' }} />
                <span>Dark Mode</span>
              </>
            )}
          </span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.theme === 'dark'} 
              onChange={toggleTheme} 
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
