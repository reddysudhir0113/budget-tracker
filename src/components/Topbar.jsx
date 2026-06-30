import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Topbar = () => {
  const { currentMonth, setCurrentMonth, settings, addToast } = useBudget();
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const months = ['2026-06', '2026-07', '2026-08', '2026-09'];

  const formatMonth = (mStr) => {
    const [year, month] = mStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="topbar">
      <div className="user-greeting">
        <h1>{getGreeting()}, {settings.userName}!</h1>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <p>
            Here's your budget overview for 
            <button 
              className="month-dropdown-btn"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            >
              {formatMonth(currentMonth)} <MdKeyboardArrowDown />
            </button>
          </p>

          {showMonthDropdown && (
            <div className="clay-card" style={{ 
              position: 'absolute', 
              top: '100%', 
              left: '170px', 
              marginTop: '4px', 
              padding: '8px',
              borderRadius: '16px',
              zIndex: 110,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '150px',
              boxShadow: 'var(--clay-shadow-card)'
            }}>
              {months.map((m) => (
                <button
                  key={m}
                  className={`clay-button ${currentMonth === m ? 'primary' : 'secondary'} clay-button-pill`}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => {
                    setCurrentMonth(m);
                    setShowMonthDropdown(false);
                  }}
                >
                  {formatMonth(m)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        <div className="avatar-container">
          <div className="avatar-img">
            {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
