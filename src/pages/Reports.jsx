import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MdOutlineAssessment, MdOutlineTrendingUp, MdPieChart } from 'react-icons/md';

const Reports = () => {
  const { transactions, categories, currentMonth } = useBudget();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'categories' | 'trends'

  // Format currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Group transactions by month for multi-month trends
  const months = ['2026-06', '2026-07', '2026-08', '2026-09'];
  
  const formatMonthName = (mStr) => {
    const [year, month] = mStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  const monthlyReportData = months.map(m => {
    const mTransactions = transactions.filter(tx => tx.date.startsWith(m));
    
    const income = mTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = mTransactions
      .filter(tx => tx.type === 'expense' || (tx.type === 'transfer' && tx.category !== 'Savings'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const savings = Math.max(income - expense, 0);

    return {
      month: formatMonthName(m),
      Income: income,
      Expenses: expense,
      Savings: savings
    };
  });

  // Calculate current month category shares
  const currentMonthTxs = transactions.filter(tx => tx.date.startsWith(currentMonth));
  const expenseByCategory = {};
  currentMonthTxs
    .filter(tx => tx.type === 'expense' || (tx.type === 'transfer' && tx.category !== 'Savings'))
    .forEach(tx => {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    });

  const COLORS = [
    '#6C63FF', '#34D399', '#FBBF24', '#22D3EE', '#FB7185', 
    '#A78BFA', '#60A5FA', '#F87171', '#14B8A6', '#EC4899'
  ];

  const categoryChartData = Object.keys(expenseByCategory).map((catName, index) => ({
    name: catName,
    value: expenseByCategory[catName],
    color: COLORS[index % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '24px' }}>Analytics & Reports</h2>
        <p className="page-subtitle">Analyze cash flows, category spending metrics, and monthly savings graphs.</p>
      </div>

      {/* Reports Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Cash Flow Overview', icon: MdOutlineAssessment },
          { id: 'categories', label: 'Category Share', icon: MdPieChart },
          { id: 'trends', label: 'Savings Trend', icon: MdOutlineTrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`clay-button clay-button-pill ${activeTab === tab.id ? 'primary' : 'secondary'}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg, var(--primary) 0%, #8278FF 100%)' : 'transparent'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cash Flow Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="clay-card">
            <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Income vs Expenses Comparison</h3>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyReportData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="var(--income)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expenses" fill="var(--expense)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Category Share */}
      {activeTab === 'categories' && (
        <div className="reports-category-grid">
          <div className="clay-card">
            <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Category Breakdown</h3>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1, color: 'var(--border-color)' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.length > 0 ? (
                      categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    ) : (
                      <Cell fill="var(--border-color)" />
                    )}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '15px' }}>Category Shares (Current Month)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryChartData.map((item, idx) => (
                <div key={item.name} className="flex-between">
                  <div className="flex-row" style={{ gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>{formatCurrency(item.value)}</span>
                </div>
              ))}

              {categoryChartData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No expense records found for this month.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Savings Trend */}
      {activeTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="clay-card">
            <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Savings Accumulation Curve</h3>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyReportData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Savings" 
                    stroke="var(--savings)" 
                    strokeWidth={4}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
