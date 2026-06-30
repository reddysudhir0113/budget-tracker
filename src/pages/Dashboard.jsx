import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import CategoryIcon from '../components/CategoryIcon';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import PersonForm from '../components/PersonForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  MdOutlineArrowUpward, 
  MdOutlineArrowDownward, 
  MdOutlineSwapHoriz, 
  MdOutlinePersonAdd,
  MdMoreVert,
  MdOutlineDelete,
  MdOutlineEdit
} from 'react-icons/md';

const Dashboard = () => {
  const { 
    transactions, 
    categories, 
    people, 
    currentMonth, 
    budgets,
    deleteTransaction 
  } = useBudget();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'income' | 'expense' | 'transfer' | 'person' | 'edit_tx'
  const [editTxId, setEditTxId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  // Popover menu state for recent transactions
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Format helper for currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter transactions for the current month
  const monthlyTransactions = transactions.filter(
    (tx) => tx.date.startsWith(currentMonth)
  );

  // Calculations
  const totalIncome = monthlyTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter((tx) => tx.type === 'expense' || (tx.type === 'transfer' && tx.category !== 'Savings'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSavings = monthlyTransactions
    .filter((tx) => tx.category === 'Savings' || (tx.type === 'transfer' && tx.category === 'Savings'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Remaining Balance = Income - Expenses - Savings (or just Income - Expenses)
  // Let's match the image: Income (35,000), Expenses (18,200), Savings (16,800) -> 35000 - 18200 = 16800.
  // So Savings is the remaining balance if no explicit transfers, or we can show remaining balance as Income - Expenses.
  const remainingBalance = totalIncome - totalExpenses;

  // Active budget limits
  const currentBudget = budgets[currentMonth] || { monthlyBudget: 0, savingsGoal: 0, emergencyFund: 0 };
  const budgetLimit = currentBudget.monthlyBudget;
  const budgetUsedPercent = Math.min(Math.round((totalExpenses / budgetLimit) * 100) || 0, 100);

  // Group expenses by category
  const expenseByCategory = {};
  monthlyTransactions
    .filter((tx) => tx.type === 'expense' || (tx.type === 'transfer' && tx.category !== 'Savings'))
    .forEach((tx) => {
      const cat = tx.category || 'Others';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + tx.amount;
    });

  // Convert to chart data format
  const COLORS = {
    Food: 'var(--food)',
    Family: 'var(--family)',
    Travel: 'var(--travel)',
    Shopping: 'var(--shopping)',
    Others: 'var(--others)',
    Bills: 'var(--bills)',
    Medical: 'var(--medical)',
    Education: 'var(--education)',
    House: 'var(--house)',
    Entertainment: 'var(--entertainment)'
  };

  const chartData = Object.keys(expenseByCategory).map((catName) => {
    return {
      name: catName,
      value: expenseByCategory[catName],
      color: COLORS[catName] || 'var(--primary)'
    };
  });

  // Sort categories for top categories indicator
  const topCategories = Object.keys(expenseByCategory)
    .map(name => ({
      name,
      amount: expenseByCategory[name],
      percent: Math.round((expenseByCategory[name] / totalExpenses) * 100) || 0,
      color: COLORS[name] || 'var(--primary)'
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const openAddModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const openEditTxModal = (id) => {
    setEditTxId(id);
    setModalType('edit_tx');
    setModalOpen(true);
    setActiveMenuId(null);
  };

  const triggerDeleteConfirm = (tx) => {
    setTxToDelete(tx);
    setDeleteConfirmOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '24px' }}>Dashboard Overview</h2>
        <p className="page-subtitle">Track your transactions, budgets and savings for the selected month.</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        {/* Income Card */}
        <div className="clay-card summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--income)' }}>
            <MdOutlineArrowUpward />
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Income</span>
            <span className="summary-card-value">{formatCurrency(totalIncome)}</span>
            <span className="summary-card-sub" style={{ color: 'var(--income)' }}>This Month</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="clay-card summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--expense)' }}>
            <MdOutlineArrowDownward />
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Expenses</span>
            <span className="summary-card-value">{formatCurrency(totalExpenses)}</span>
            <span className="summary-card-sub" style={{ color: 'var(--expense)' }}>This Month</span>
          </div>
        </div>

        {/* Savings Card */}
        <div className="clay-card summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--savings)' }}>
            <MdOutlineSwapHoriz />
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Savings / Balance</span>
            <span className="summary-card-value">{formatCurrency(remainingBalance)}</span>
            <span className="summary-card-sub" style={{ color: 'var(--savings)' }}>Remaining</span>
          </div>
        </div>

        {/* Total Transactions Card */}
        <div className="clay-card summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--family)' }}>
            <CategoryIcon icon="others" />
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Transactions</span>
            <span className="summary-card-value">{monthlyTransactions.length}</span>
            <span className="summary-card-sub" style={{ color: 'var(--family)' }}>This Month</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Charts & Recent Transactions */}
        <div className="dashboard-left">
          {/* Expenses Breakdown */}
          <div className="clay-card expenses-overview-grid">
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Expenses Overview</h3>
              <div style={{ height: '200px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.length > 0 ? chartData : [{ name: 'No Expenses', value: 1, color: 'var(--border-color)' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.length > 0 ? (
                        chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      ) : (
                        <Cell fill="var(--border-color)" />
                      )}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total Text in Doughnut Center */}
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, display: 'block' }}>
                    {formatCurrency(totalExpenses)}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total</span>
                </div>
              </div>
            </div>

            {/* Category percentages list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Amount</span>
              </div>
              
              {topCategories.length > 0 ? (
                topCategories.map((item) => (
                  <div key={item.name} className="flex-between">
                    <div className="flex-row" style={{ gap: '8px' }}>
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: item.color 
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <div className="flex-row" style={{ gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>{formatCurrency(item.amount)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '32px', textAlign: 'right' }}>
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No expense records this month.
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="clay-card">
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px' }}>Recent Transactions</h3>
              <Link to="/transactions" className="clay-button secondary clay-button-pill" style={{ textDecoration: 'none', fontSize: '12px', padding: '6px 14px' }}>
                View All
              </Link>
            </div>

            <div className="transaction-list">
              {monthlyTransactions.slice(0, 7).map((tx) => {
                const isIncome = tx.type === 'income';
                const matchedCategory = categories.find(c => c.name === tx.category) || { color: 'var(--others)', icon: 'others' };
                const associatedPerson = tx.personId ? people.find(p => p.id === tx.personId) : null;
                
                return (
                  <div key={tx.id} className="transaction-item" style={{ position: 'relative' }}>
                    <div className="flex-row">
                      <div 
                        className="transaction-icon-box" 
                        style={{ 
                          backgroundColor: `${matchedCategory.color}25`, 
                          color: matchedCategory.color 
                        }}
                      >
                        <CategoryIcon icon={matchedCategory.icon} />
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-title">{tx.description}</div>
                        <div className="transaction-meta">
                          {tx.category} {associatedPerson && `• Given to ${associatedPerson.name}`} • {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="transaction-amount-info">
                      <span className={`transaction-amount ${isIncome ? 'positive' : 'negative'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                      
                      <div style={{ position: 'relative' }}>
                        <button 
                          className="transaction-more-btn"
                          onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                        >
                          <MdMoreVert />
                        </button>
                        
                        {activeMenuId === tx.id && (
                          <div className="clay-card" style={{ 
                            position: 'absolute', 
                            right: 0, 
                            top: '100%', 
                            marginTop: '4px',
                            padding: '6px',
                            borderRadius: '12px',
                            zIndex: 10,
                            minWidth: '100px',
                            boxShadow: 'var(--clay-shadow-card)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <button 
                              className="clay-button secondary clay-button-pill"
                              style={{ width: '100%', padding: '6px 12px', justifyContent: 'flex-start', fontSize: '11px', border: 'none' }}
                              onClick={() => openEditTxModal(tx.id)}
                            >
                              <MdOutlineEdit style={{ marginRight: '6px' }} /> Edit
                            </button>
                            <button 
                              className="clay-button expense clay-button-pill"
                              style={{ width: '100%', padding: '6px 12px', justifyContent: 'flex-start', fontSize: '11px' }}
                              onClick={() => triggerDeleteConfirm(tx)}
                            >
                              <MdOutlineDelete style={{ marginRight: '6px' }} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {monthlyTransactions.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <img src={`${import.meta.env.BASE_URL}empty_state_wallet.png`} alt="No Transactions" style={{ width: '80px', height: '80px', marginBottom: '12px', objectFit: 'contain' }} />
                  <h4>No transactions recorded yet!</h4>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Click one of the buttons on the right to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions, Budgets, and Stats */}
        <div className="dashboard-right">
          {/* Quick Actions */}
          <div className="clay-card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => openAddModal('income')}>
                <div className="quick-action-icon" style={{ backgroundColor: 'var(--income)' }}>
                  <MdOutlineArrowUpward />
                </div>
                <span className="quick-action-label">Add Income</span>
              </button>

              <button className="quick-action-btn" onClick={() => openAddModal('expense')}>
                <div className="quick-action-icon" style={{ backgroundColor: 'var(--expense)' }}>
                  <MdOutlineArrowDownward />
                </div>
                <span className="quick-action-label">Add Expense</span>
              </button>

              <button className="quick-action-btn" onClick={() => openAddModal('transfer')}>
                <div className="quick-action-icon" style={{ backgroundColor: 'var(--primary)' }}>
                  <MdOutlineSwapHoriz />
                </div>
                <span className="quick-action-label">Add Transfer</span>
              </button>

              <button className="quick-action-btn" onClick={() => openAddModal('person')}>
                <div className="quick-action-icon" style={{ backgroundColor: 'var(--family)' }}>
                  <MdOutlinePersonAdd />
                </div>
                <span className="quick-action-label">Add Person</span>
              </button>
            </div>
          </div>

          {/* Budget Gauge */}
          <div className="clay-card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Budget Summary</h3>
            
            <div className="budget-gauge-container">
              {/* Custom SVG Semi-circle gauge */}
              <svg width="200" height="110" viewBox="0 0 200 110">
                <path 
                  d="M20,100 A80,80 0 0,1 180,100" 
                  fill="none" 
                  style={{ stroke: 'var(--border-color)' }}
                  strokeWidth="16" 
                  strokeLinecap="round"
                />
                <path 
                  d="M20,100 A80,80 0 0,1 180,100" 
                  fill="none" 
                  style={{ stroke: 'var(--income)', transition: 'stroke-dashoffset 0.8s ease' }}
                  strokeWidth="16" 
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * budgetUsedPercent) / 100}
                />
              </svg>
              
              <div className="budget-gauge-value">
                <span className="budget-gauge-percent">{budgetUsedPercent}%</span>
                <span className="budget-gauge-label">of Budget Used</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <div className="flex-between" style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Budget Limit</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(budgetLimit)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Spent</span>
                <span style={{ fontWeight: 700, color: 'var(--expense)' }}>{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining</span>
                <span style={{ fontWeight: 700, color: 'var(--income)' }}>{formatCurrency(remainingBalance >= 0 ? remainingBalance : 0)}</span>
              </div>
            </div>
          </div>

          {/* Top Spending Categories Progress */}
          <div className="clay-card">
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Top Categories</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topCategories.map((item) => (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="flex-between" style={{ fontSize: '12px', fontWeight: 600 }}>
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="custom-progress-bar">
                    <div 
                      className="custom-progress-fill" 
                      style={{ 
                        width: `${item.percent}%`, 
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                </div>
              ))}

              {topCategories.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No categories to display.
                </div>
              )}
            </div>
          </div>

          {/* Banner notification */}
          <div 
            className="clay-card" 
            style={{ 
              background: budgetLimit === 0
                ? 'linear-gradient(135deg, var(--primary-light) 0%, rgba(108, 99, 255, 0.05) 100%)'
                : totalExpenses <= budgetLimit 
                  ? 'linear-gradient(135deg, var(--primary-light) 0%, rgba(108, 99, 255, 0.05) 100%)'
                  : 'linear-gradient(135deg, var(--expense-light) 0%, rgba(248, 113, 113, 0.05) 100%)',
              border: 'none',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ flex: 1 }}>
              {budgetLimit === 0 ? (
                <>
                  <h4 style={{ fontSize: '13px', color: 'var(--primary)' }}>Set Your Budget Target 🎯</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Go to the <Link to="/goals" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>Goals</Link> page to set your target monthly limits.
                  </p>
                </>
              ) : totalExpenses <= budgetLimit ? (
                <>
                  <h4 style={{ fontSize: '13px', color: 'var(--primary)' }}>Great Job!</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    You are spending within your budget this month.
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: '13px', color: 'var(--expense)' }}>Alert!</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    You have exceeded your monthly budget limit.
                  </p>
                </>
              )}
            </div>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={budgetLimit === 0 ? `${import.meta.env.BASE_URL}clay_piggy_bank.png` : totalExpenses <= budgetLimit ? `${import.meta.env.BASE_URL}trophy_cup.png` : `${import.meta.env.BASE_URL}warning_siren.png`} 
                alt="Status Icon" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Forms Modals */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={
          modalType === 'income' ? 'Add Income' :
          modalType === 'expense' ? 'Add Expense' :
          modalType === 'transfer' ? 'Add Transfer' :
          modalType === 'person' ? 'Add Person' :
          'Edit Transaction'
        }
      >
        {modalType === 'person' ? (
          <PersonForm onSubmitSuccess={() => setModalOpen(false)} />
        ) : (
          <TransactionForm 
            transactionId={modalType === 'edit_tx' ? editTxId : null} 
            initialType={modalType} 
            onSubmitSuccess={() => setModalOpen(false)} 
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This will adjust your monthly calculations immediately."
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
