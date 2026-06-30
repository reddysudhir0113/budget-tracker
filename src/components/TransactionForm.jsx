import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';

const TransactionForm = ({ transactionId = null, onSubmitSuccess, initialType = 'expense' }) => {
  const { 
    transactions, 
    categories, 
    people, 
    currentMonth,
    addTransaction, 
    updateTransaction 
  } = useBudget();

  const isEdit = !!transactionId;
  const currentTransaction = isEdit ? transactions.find(tx => tx.id === transactionId) : null;

  // Form states
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    // Default to current date or month-based date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (todayStr.startsWith(currentMonth)) {
      return todayStr;
    }
    return `${currentMonth}-01`;
  });
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [personId, setPersonId] = useState('');
  const [status, setStatus] = useState('completed');

  // Load existing data if editing
  useEffect(() => {
    if (currentTransaction) {
      setType(currentTransaction.type);
      setCategory(currentTransaction.category);
      setAmount(currentTransaction.amount.toString());
      setDate(currentTransaction.date);
      setDescription(currentTransaction.description || '');
      setNotes(currentTransaction.notes || '');
      setPersonId(currentTransaction.personId || '');
      setStatus(currentTransaction.status || 'completed');
    } else {
      setType(initialType);
      // Pick first matching category
      const filtered = categories.filter(c => c.type === initialType || (initialType === 'transfer' && c.type === 'transfer'));
      if (filtered.length > 0) {
        setCategory(filtered[0].name);
      }
    }
  }, [currentTransaction, initialType, categories]);

  // Adjust categories when type changes
  useEffect(() => {
    if (!isEdit) {
      const filtered = categories.filter(c => c.type === type || (type === 'transfer' && c.type === 'transfer'));
      if (filtered.length > 0) {
        setCategory(filtered[0].name);
      } else {
        setCategory('');
      }
    }
  }, [type, categories, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const data = {
      type,
      category,
      amount: parseFloat(amount),
      date,
      description: description || category || type,
      notes,
      status,
      personId: (category === 'Family' || type === 'transfer') ? personId : ''
    };

    if (isEdit) {
      updateTransaction(transactionId, data);
    } else {
      addTransaction(data);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const filteredCategories = categories.filter(c => {
    if (type === 'transfer') return c.type === 'transfer';
    return c.type === type;
  });

  const showPersonSelector = type === 'transfer' || category === 'Family';

  return (
    <form onSubmit={handleSubmit} className="modal-body" style={{ padding: 0 }}>
      {/* Type Selector Tabs */}
      <div className="form-group">
        <label>Transaction Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {['income', 'expense', 'transfer'].map((t) => (
            <button
              key={t}
              type="button"
              className={`clay-button ${type === t ? (t === 'income' ? 'income' : t === 'expense' ? 'expense' : 'primary') : 'secondary'} clay-button-pill`}
              onClick={() => !isEdit && setType(t)}
              style={{ 
                textTransform: 'capitalize',
                opacity: isEdit && type !== t ? 0.5 : 1,
                cursor: isEdit ? 'not-allowed' : 'pointer'
              }}
              disabled={isEdit}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        {/* Category */}
        <div className="form-group">
          <label htmlFor="tx-category">Category</label>
          <select 
            id="tx-category"
            className="clay-input clay-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="tx-amount">Amount (₹)</label>
          <input
            id="tx-amount"
            type="number"
            step="any"
            min="0.01"
            className="clay-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      {showPersonSelector && (
        <div className="form-group">
          <label htmlFor="tx-person">Given To / Associated Person</label>
          <select 
            id="tx-person"
            className="clay-input clay-select"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            required
          >
            <option value="">-- Select Person --</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-row">
        {/* Date */}
        <div className="form-group">
          <label htmlFor="tx-date">Date</label>
          <input
            id="tx-date"
            type="date"
            className="clay-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Status */}
        <div className="form-group">
          <label htmlFor="tx-status">Status</label>
          <select 
            id="tx-status"
            className="clay-input clay-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="tx-description">Description (Optional)</label>
        <input
          id="tx-description"
          type="text"
          className="clay-input"
          placeholder="e.g. Monthly salary, Lunch (defaults to Category)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="form-group">
        <label htmlFor="tx-notes">Notes (Optional)</label>
        <textarea
          id="tx-notes"
          className="clay-input"
          placeholder="Add extra details..."
          rows={3}
          style={{ resize: 'none' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="clay-button secondary clay-button-pill" onClick={onSubmitSuccess}>
          Cancel
        </button>
        <button type="submit" className="clay-button primary clay-button-pill">
          {isEdit ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
