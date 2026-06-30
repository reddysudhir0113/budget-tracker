import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import CategoryIcon from '../components/CategoryIcon';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  MdSearch, 
  MdAdd, 
  MdOutlineDelete, 
  MdOutlineEdit, 
  MdChevronLeft, 
  MdChevronRight,
  MdFilterList
} from 'react-icons/md';

const Transactions = () => {
  const { 
    transactions, 
    categories, 
    people, 
    currentMonth, 
    deleteTransaction 
  } = useBudget();

  // Modal and Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTxId, setEditTxId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense' | 'transfer'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Format helper for currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // 1. Search term match (description, notes, category)
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Type match
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      // 3. Category match
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      // 4. Status match
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

      // 5. Month match (By default, we view the current active month, but let users search everything or let it be scoped to active month. Scoped to currentMonth is standard as per dashboard, but in Transactions page, let's filter by the active global currentMonth or allow switching. Let's scope it to the active global currentMonth for coherence.)
      const matchesMonth = tx.date.startsWith(currentMonth);

      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesMonth;
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openAddModal = () => {
    setEditTxId(null);
    setModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditTxId(id);
    setModalOpen(true);
  };

  const triggerDeleteConfirm = (tx) => {
    setTxToDelete(tx);
    setDeleteConfirmOpen(true);
  };

  // Unique list of categories in the system for dropdown filters
  const uniqueCategories = Array.from(new Set(categories.map(c => c.name)));

  return (
    <div className="fade-in">
      <div className="flex-between page-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '24px' }}>Transactions History</h2>
          <p className="page-subtitle">View, search, filter and manage your transactions ledger.</p>
        </div>
        <button className="clay-button primary" onClick={openAddModal}>
          <MdAdd size={20} /> Add Transaction
        </button>
      </div>

      {/* Search, Sort and Filter Bar */}
      <div className="clay-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Search and Sort */}
          <div className="search-sort-grid">
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="clay-input"
                placeholder="Search description, category, or note details..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ paddingLeft: '44px' }}
              />
              <MdSearch 
                size={22} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
            </div>
            
            <select
              className="clay-input clay-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Row 2: Filtering Tabs & Selectors */}
          <div className="filter-bar">
            {/* Type tabs */}
            <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--border-color)', padding: '4px', borderRadius: '12px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'income', label: 'Income' },
                { id: 'expense', label: 'Expense' },
                { id: 'transfer', label: 'Transfer' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`clay-button clay-button-pill ${typeFilter === tab.id ? 'primary' : 'secondary'}`}
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '12px', 
                    boxShadow: typeFilter === tab.id ? 'var(--clay-shadow-button)' : 'none',
                    border: 'none',
                    background: typeFilter === tab.id ? 'linear-gradient(135deg, var(--primary) 0%, #8278FF 100%)' : 'transparent'
                  }}
                  onClick={() => {
                    setTypeFilter(tab.id);
                    setCurrentPage(1);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="flex-row" style={{ gap: '6px' }}>
                <MdFilterList size={18} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Filters:</span>
              </div>
              
              <select
                className="clay-input clay-select clay-button-pill"
                style={{ width: '140px', padding: '8px 30px 8px 12px' }}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className="clay-input clay-select clay-button-pill"
                style={{ width: '130px', padding: '8px 30px 8px 12px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="clay-card" style={{ padding: '24px' }}>
        <div className="transaction-list">
          {currentItems.map((tx) => {
            const isIncome = tx.type === 'income';
            const matchedCategory = categories.find(c => c.name === tx.category) || { color: 'var(--others)', icon: 'others' };
            const associatedPerson = tx.personId ? people.find(p => p.id === tx.personId) : null;

            return (
              <div key={tx.id} className="transaction-item">
                <div className="flex-row" style={{ flex: 1 }}>
                  <div 
                    className="transaction-icon-box" 
                    style={{ 
                      backgroundColor: `${matchedCategory.color}25`, 
                      color: matchedCategory.color 
                    }}
                  >
                    <CategoryIcon icon={matchedCategory.icon} />
                  </div>
                  
                  <div className="transaction-details transaction-details-grid">
                    <div>
                      <div className="transaction-title">{tx.description}</div>
                      <div className="transaction-meta">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{tx.category}</div>
                      {associatedPerson && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Given to {associatedPerson.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className={`clay-badge ${tx.status === 'completed' ? 'income' : 'expense'}`} style={{ textTransform: 'capitalize' }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="transaction-amount-info" style={{ gap: '20px' }}>
                  <span className={`transaction-amount ${isIncome ? 'positive' : 'negative'}`} style={{ fontSize: '16px' }}>
                    {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="clay-button secondary clay-button-pill"
                      style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px', border: 'none' }}
                      onClick={() => openEditModal(tx.id)}
                    >
                      <MdOutlineEdit size={16} />
                    </button>
                    <button 
                      className="clay-button expense clay-button-pill"
                      style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
                      onClick={() => triggerDeleteConfirm(tx)}
                    >
                      <MdOutlineDelete size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {currentItems.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <img src={`${import.meta.env.BASE_URL}search_empty_state.png`} alt="No matches" style={{ width: '80px', height: '80px', marginBottom: '16px', objectFit: 'contain' }} />
              <h4>No transactions found matching your criteria</h4>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Try resetting the filters or add a new transaction.</p>
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex-between" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="clay-button secondary clay-button-pill"
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdChevronLeft size={18} /> Prev
              </button>
              
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    className={`clay-button clay-button-pill ${currentPage === pNum ? 'primary' : 'secondary'}`}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      padding: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: currentPage === pNum ? 'linear-gradient(135deg, var(--primary) 0%, #8278FF 100%)' : 'transparent',
                      border: 'none'
                    }}
                    onClick={() => handlePageChange(pNum)}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                className="clay-button secondary clay-button-pill"
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editTxId ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm 
          transactionId={editTxId} 
          onSubmitSuccess={() => setModalOpen(false)} 
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? All summaries and reports for this month will update automatically."
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

export default Transactions;
