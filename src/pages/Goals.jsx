import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { MdTrackChanges, MdOutlineSave, MdAccountBalance, MdTrendingUp } from 'react-icons/md';

const Goals = () => {
  const { transactions, currentMonth, budgets, updateBudget } = useBudget();

  // Active budget targets
  const currentBudget = budgets[currentMonth] || { monthlyBudget: 0, savingsGoal: 0, emergencyFund: 0 };

  // Local Form states
  const [budgetLimit, setBudgetLimit] = useState(currentBudget.monthlyBudget);
  const [savingsTarget, setSavingsTarget] = useState(currentBudget.savingsGoal);
  const [emergencyTarget, setEmergencyTarget] = useState(currentBudget.emergencyFund);

  // Sync when global currentBudget updates (e.g. when changing months)
  useEffect(() => {
    setBudgetLimit(currentBudget.monthlyBudget);
    setSavingsTarget(currentBudget.savingsGoal);
    setEmergencyTarget(currentBudget.emergencyFund);
  }, [currentBudget, currentMonth]);

  // Calculations for current month
  const monthlyTransactions = transactions.filter(
    (tx) => tx.date.startsWith(currentMonth)
  );

  const totalIncome = monthlyTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter((tx) => tx.type === 'expense' || (tx.type === 'transfer' && tx.category !== 'Savings'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Remaining balance
  const remainingBalance = totalIncome - totalExpenses;

  // Let's assume savings achieved is the remaining balance (since what is left is saved)
  // or explicit transfers to Savings category
  const explicitSavings = monthlyTransactions
    .filter(tx => tx.category === 'Savings')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalSaved = Math.max(remainingBalance, 0) + explicitSavings;

  // Percent calculations
  const expensePercent = Math.min(Math.round((totalExpenses / currentBudget.monthlyBudget) * 100) || 0, 150); // allow overflow indicators
  const savingsPercent = Math.min(Math.round((totalSaved / currentBudget.savingsGoal) * 100) || 0, 100);
  
  // For emergency fund, let's assume the user has accumulated a portion of it (e.g., remaining savings or static contribution)
  const emergencySaved = Math.min(totalSaved * 0.3, currentBudget.emergencyFund); // mock 30% of savings going to emergency
  const emergencyPercent = Math.min(Math.round((emergencySaved / currentBudget.emergencyFund) * 100) || 0, 100);

  // Currency formatter
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSaveGoals = (e) => {
    e.preventDefault();
    updateBudget(currentMonth, {
      monthlyBudget: parseFloat(budgetLimit) || 0,
      savingsGoal: parseFloat(savingsTarget) || 0,
      emergencyFund: parseFloat(emergencyTarget) || 0
    });
  };

  const formatMonth = (mStr) => {
    const [year, month] = mStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '24px' }}>Financial Goals</h2>
        <p className="page-subtitle">Define and monitor your target limits, savings quotas, and emergency reserves for {formatMonth(currentMonth)}.</p>
      </div>

      <div className="goals-layout-grid">
        {/* Left Side: Progress Visualizers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Monthly Spending Budget Card */}
          <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <div className="flex-row" style={{ gap: '12px' }}>
                <div className="clay-icon-container" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
                  <MdTrendingUp size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px' }}>Monthly Budget Limit</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Maximum limit for standard expenses</span>
                </div>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: expensePercent > 100 ? 'var(--expense)' : 'var(--text-primary)' }}>
                {expensePercent}% Used
              </span>
            </div>

            <div className="custom-progress-bar" style={{ height: '14px' }}>
              <div 
                className="custom-progress-fill" 
                style={{ 
                  width: `${Math.min(expensePercent, 100)}%`, 
                  backgroundColor: expensePercent > 100 ? 'var(--expense)' : 'var(--income)' 
                }} 
              />
            </div>

            <div className="flex-between" style={{ fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Spent: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(totalExpenses)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Budget Limit: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(currentBudget.monthlyBudget)}</span>
              </div>
            </div>
          </div>

          {/* Monthly Savings Target Card */}
          <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <div className="flex-row" style={{ gap: '12px' }}>
                <div className="clay-icon-container" style={{ backgroundColor: 'var(--savings-light)', color: 'var(--savings)' }}>
                  <MdOutlineSave size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px' }}>Savings Target</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Goal to save from remaining balances</span>
                </div>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--savings)' }}>
                {savingsPercent}% Achieved
              </span>
            </div>

            <div className="custom-progress-bar" style={{ height: '14px' }}>
              <div 
                className="custom-progress-fill" 
                style={{ 
                  width: `${savingsPercent}%`, 
                  backgroundColor: 'var(--savings)' 
                }} 
              />
            </div>

            <div className="flex-between" style={{ fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Saved: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(totalSaved)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Target Goal: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(currentBudget.savingsGoal)}</span>
              </div>
            </div>
          </div>

          {/* Emergency Fund Card */}
          <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <div className="flex-row" style={{ gap: '12px' }}>
                <div className="clay-icon-container" style={{ backgroundColor: 'var(--family-light)', color: 'var(--family)' }}>
                  <MdAccountBalance size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px' }}>Emergency Reserves</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Backup liquid reserves for unexpected events</span>
                </div>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--family)' }}>
                {emergencyPercent}% Stashed
              </span>
            </div>

            <div className="custom-progress-bar" style={{ height: '14px' }}>
              <div 
                className="custom-progress-fill" 
                style={{ 
                  width: `${emergencyPercent}%`, 
                  backgroundColor: 'var(--family)' 
                }} 
              />
            </div>

            <div className="flex-between" style={{ fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Stashed: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(emergencySaved)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Reserve Goal: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(currentBudget.emergencyFund)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Goals Configurator */}
        <div className="clay-card" style={{ alignSelf: 'start' }}>
          <div className="flex-row" style={{ gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <MdTrackChanges size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px' }}>Configure Targets</h3>
          </div>

          <form onSubmit={handleSaveGoals} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-group">
              <label htmlFor="goal-budget">Monthly Budget Limit (₹)</label>
              <input
                id="goal-budget"
                type="number"
                min="0"
                className="clay-input"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal-savings">Savings Goal Target (₹)</label>
              <input
                id="goal-savings"
                type="number"
                min="0"
                className="clay-input"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal-emergency">Emergency Fund Target (₹)</label>
              <input
                id="goal-emergency"
                type="number"
                min="0"
                className="clay-input"
                value={emergencyTarget}
                onChange={(e) => setEmergencyTarget(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="clay-button primary" style={{ marginTop: '12px', width: '100%' }}>
              Save Goals
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Goals;
