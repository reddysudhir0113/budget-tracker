import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import Modal from '../components/Modal';
import PersonForm from '../components/PersonForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import CategoryIcon from '../components/CategoryIcon';
import { 
  MdAdd, 
  MdOutlineEdit, 
  MdOutlineDelete, 
  MdPhone, 
  MdNotes, 
  MdClose,
  MdOutlineHistory 
} from 'react-icons/md';

const People = () => {
  const { people, transactions, currentMonth, deletePerson } = useBudget();

  // Modal and Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [editPersonId, setEditPersonId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);

  // Inspector panel state (to inspect transactions for a specific person)
  const [inspectPersonId, setInspectPersonId] = useState(null);

  // Currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get active year (e.g. '2026')
  const currentYear = currentMonth.split('-')[0];

  // Calculate statistics for a person
  const getPersonStats = (pId) => {
    const personTxs = transactions.filter(tx => tx.personId === pId);
    
    const monthly = personTxs
      .filter(tx => tx.date.startsWith(currentMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const yearly = personTxs
      .filter(tx => tx.date.startsWith(currentYear))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const lifetime = personTxs
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { monthly, yearly, lifetime, history: personTxs };
  };

  const openAddModal = () => {
    setEditPersonId(null);
    setModalOpen(true);
  };

  const openEditModal = (id, e) => {
    e.stopPropagation(); // Avoid triggering inspector
    setEditPersonId(id);
    setModalOpen(true);
  };

  const triggerDeleteConfirm = (person, e) => {
    e.stopPropagation(); // Avoid triggering inspector
    setPersonToDelete(person);
    setDeleteConfirmOpen(true);
  };

  const inspectedPerson = people.find(p => p.id === inspectPersonId);
  const inspectedStats = inspectedPerson ? getPersonStats(inspectPersonId) : null;

  return (
    <div className="fade-in">
      <div className="flex-between page-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '24px' }}>People & Family</h2>
          <p className="page-subtitle">Track payments, loans, and transfers given to family members, landlords, and others.</p>
        </div>
        <button className="clay-button primary" onClick={openAddModal}>
          <MdAdd size={20} /> Add Person
        </button>
      </div>

      <div className={`people-layout-grid ${inspectPersonId ? 'with-inspector' : ''}`}>
        {/* People Grid */}
        <div className="people-cards-grid">
          {people.map((person) => {
            const stats = getPersonStats(person.id);
            const isActive = inspectPersonId === person.id;

            return (
              <div 
                key={person.id} 
                className={`clay-card ${isActive ? 'clay-card-floating' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  padding: '24px'
                }}
                onClick={() => setInspectPersonId(isActive ? null : person.id)}
              >
                <div className="flex-between">
                  <div className="flex-row" style={{ gap: '14px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      backgroundColor: person.avatarColor, 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                      boxShadow: 'var(--clay-shadow-badge)'
                    }}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px' }}>{person.name}</h3>
                      <span className="clay-badge family" style={{ fontSize: '9px', padding: '2px 6px', marginTop: '3px' }}>
                        {person.relationship}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className="clay-button secondary clay-button-pill"
                      style={{ padding: '6px', width: '28px', height: '28px', border: 'none', borderRadius: '50%' }}
                      onClick={(e) => openEditModal(person.id, e)}
                    >
                      <MdOutlineEdit size={14} />
                    </button>
                    <button 
                      className="clay-button expense clay-button-pill"
                      style={{ padding: '6px', width: '28px', height: '28px', borderRadius: '50%' }}
                      onClick={(e) => triggerDeleteConfirm(person, e)}
                    >
                      <MdOutlineDelete size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {person.phone && (
                    <div className="flex-row" style={{ gap: '8px' }}>
                      <MdPhone size={14} /> <span>{person.phone}</span>
                    </div>
                  )}
                  {person.notes && (
                    <div className="flex-row" style={{ gap: '8px' }}>
                      <MdNotes size={14} /> <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{person.notes}</span>
                    </div>
                  )}
                </div>

                {/* Ledger stats */}
                <div style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderRadius: '16px', 
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div className="flex-between" style={{ fontSize: '11px' }}>
                    <span>This Month</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(stats.monthly)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: '11px' }}>
                    <span>Yearly ({currentYear})</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(stats.yearly)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: '11px', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Lifetime</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(stats.lifetime)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inspector Panel */}
        {inspectPersonId && inspectedPerson && inspectedStats && (
          <div className="clay-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div className="flex-row" style={{ gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: inspectedPerson.avatarColor, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {inspectedPerson.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px' }}>{inspectedPerson.name}'s History</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Detailed ledger entries</p>
                </div>
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}
                onClick={() => setInspectPersonId(null)}
              >
                <MdClose size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="flex-between">
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lifetime Given:</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(inspectedStats.lifetime)}</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Transactions Count:</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{inspectedStats.history.length}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div className="flex-row" style={{ gap: '6px', marginBottom: '14px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <MdOutlineHistory /> <span>Recent Transactions</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {inspectedStats.history.map(tx => (
                  <div key={tx.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{tx.description}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--expense)' }}>
                      - {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}

                {inspectedStats.history.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    No recorded transactions for this person.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forms Modals */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editPersonId ? 'Edit Person Details' : 'Add New Person'}
      >
        <PersonForm 
          personId={editPersonId} 
          onSubmitSuccess={() => setModalOpen(false)} 
        />
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Remove Person"
        message={`Are you sure you want to remove ${personToDelete?.name} from your contacts? The transactions linked to this person will remain, but the name relationship association will be cleared.`}
        onConfirm={() => {
          if (personToDelete) {
            deletePerson(personToDelete.id);
            setPersonToDelete(null);
            if (inspectPersonId === personToDelete.id) {
              setInspectPersonId(null);
            }
          }
        }}
      />
    </div>
  );
};

export default People;
