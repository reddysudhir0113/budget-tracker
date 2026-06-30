import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import CategoryIcon from '../components/CategoryIcon';
import Modal from '../components/Modal';
import CategoryForm from '../components/CategoryForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { MdAdd, MdOutlineEdit, MdOutlineDelete } from 'react-icons/md';

const Categories = () => {
  const { categories, transactions, currentMonth, deleteCategory } = useBudget();
  
  // Modal & Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  // Format helper for currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get total volume for a category in the current month
  const getCategoryTotal = (catName) => {
    return transactions
      .filter(tx => tx.category === catName && tx.date.startsWith(currentMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const openAddModal = () => {
    setEditCatId(null);
    setModalOpen(true);
  };

  const openEditModal = (id) => {
    setEditCatId(id);
    setModalOpen(true);
  };

  const triggerDeleteConfirm = (cat) => {
    setCatToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="fade-in">
      <div className="flex-between page-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '24px' }}>Categories Management</h2>
          <p className="page-subtitle">Personalize your tracking by editing default categories or adding custom ones.</p>
        </div>
        <button className="clay-button primary" onClick={openAddModal}>
          <MdAdd size={20} /> Add Category
        </button>
      </div>

      <div className="category-grid">
        {categories.map((cat) => {
          const totalThisMonth = getCategoryTotal(cat.name);
          const isIncome = cat.type === 'income';
          
          return (
            <div key={cat.id} className="clay-card category-card" style={{ borderLeft: `6px solid ${cat.color}` }}>
              <div className="category-card-header">
                <div 
                  className="clay-icon-container" 
                  style={{ 
                    backgroundColor: `${cat.color}20`, 
                    color: cat.color,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%'
                  }}
                >
                  <CategoryIcon icon={cat.icon} size={22} />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="clay-button secondary clay-button-pill"
                    style={{ padding: '6px', width: '32px', height: '32px', border: 'none', borderRadius: '50%' }}
                    onClick={() => openEditModal(cat.id)}
                  >
                    <MdOutlineEdit size={14} />
                  </button>
                  
                  {/* Avoid deleting default categories that might break core layout, but allow editing, or allow delete with caution */}
                  <button 
                    className="clay-button expense clay-button-pill"
                    style={{ padding: '6px', width: '32px', height: '32px', borderRadius: '50%' }}
                    onClick={() => triggerDeleteConfirm(cat)}
                  >
                    <MdOutlineDelete size={14} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{cat.name}</h3>
                <span 
                  className={`clay-badge ${isIncome ? 'income' : cat.type === 'transfer' ? 'savings' : 'expense'}`}
                  style={{ fontSize: '10px', padding: '3px 8px', marginTop: '6px', textTransform: 'capitalize' }}
                >
                  {cat.type}
                </span>
              </div>

              <p style={{ fontSize: '12px', minHeight: '36px', color: 'var(--text-secondary)' }}>
                {cat.description || 'No description provided.'}
              </p>

              <div style={{ 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '12px', 
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>This Month:</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 800, 
                  color: totalThisMonth > 0 ? (isIncome ? 'var(--income)' : 'var(--text-primary)') : 'var(--text-tertiary)' 
                }}>
                  {totalThisMonth > 0 ? (isIncome ? '+' : '-') : ''}{formatCurrency(totalThisMonth)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCatId ? 'Edit Category' : 'Create Category'}
      >
        <CategoryForm 
          categoryId={editCatId} 
          onSubmitSuccess={() => setModalOpen(false)} 
        />
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Category"
        message={`Are you sure you want to delete the "${catToDelete?.name}" category? Transactions with this category will remain, but their icons and color associations will revert to default.`}
        onConfirm={() => {
          if (catToDelete) {
            deleteCategory(catToDelete.id);
            setCatToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Categories;
