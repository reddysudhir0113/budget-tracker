import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';

const CategoryForm = ({ categoryId = null, onSubmitSuccess }) => {
  const { categories, addCategory, updateCategory } = useBudget();
  const isEdit = !!categoryId;
  const currentCategory = isEdit ? categories.find(c => c.id === categoryId) : null;

  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('others');
  const [color, setColor] = useState('var(--others)');
  const [description, setDescription] = useState('');

  const colors = [
    'var(--salary)',
    'var(--income)',
    'var(--food)',
    'var(--travel)',
    'var(--family)',
    'var(--shopping)',
    'var(--medical)',
    'var(--education)',
    'var(--bills)',
    'var(--entertainment)',
    'var(--house)',
    'var(--savings)',
    'var(--others)'
  ];

  const icons = [
    'salary', 'freelance', 'food', 'travel', 'family', 'shopping', 
    'medical', 'education', 'bills', 'entertainment', 'house', 'savings', 'others'
  ];

  useEffect(() => {
    if (currentCategory) {
      setName(currentCategory.name);
      setType(currentCategory.type);
      setIcon(currentCategory.icon);
      setColor(currentCategory.color);
      setDescription(currentCategory.description || '');
    }
  }, [currentCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const data = { name, type, icon, color, description };

    if (isEdit) {
      updateCategory(categoryId, data);
    } else {
      addCategory(data);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-body" style={{ padding: 0 }}>
      {/* Name */}
      <div className="form-group">
        <label htmlFor="cat-name">Category Name</label>
        <input
          id="cat-name"
          type="text"
          className="clay-input"
          placeholder="e.g. Subscriptions, Pet Care"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        {/* Type */}
        <div className="form-group">
          <label htmlFor="cat-type">Type</label>
          <select
            id="cat-type"
            className="clay-input clay-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {/* Icon */}
        <div className="form-group">
          <label htmlFor="cat-icon">Icon Style</label>
          <select
            id="cat-icon"
            className="clay-input clay-select"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            style={{ textTransform: 'capitalize' }}
          >
            {icons.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Color Picker */}
      <div className="form-group">
        <label>Theme Color</label>
        <div className="color-picker-grid">
          {colors.map((c) => (
            <div
              key={c}
              className={`color-option ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="cat-desc">Description</label>
        <input
          id="cat-desc"
          type="text"
          className="clay-input"
          placeholder="Short description of this category"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="clay-button secondary clay-button-pill" onClick={onSubmitSuccess}>
          Cancel
        </button>
        <button type="submit" className="clay-button primary clay-button-pill">
          {isEdit ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
