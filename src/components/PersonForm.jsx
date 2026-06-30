import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';

const PersonForm = ({ personId = null, onSubmitSuccess }) => {
  const { people, addPerson, updatePerson } = useBudget();
  const isEdit = !!personId;
  const currentPerson = isEdit ? people.find(p => p.id === personId) : null;

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState('#6C63FF');

  const avatarColors = [
    '#A78BFA', // Purple
    '#60A5FA', // Blue
    '#34D399', // Green
    '#FBBF24', // Yellow
    '#FB7185', // Pink
    '#6C63FF', // Indigo
    '#EC4899', // Magenta
    '#14B8A6', // Teal
    '#F87171'  // Red
  ];

  const relationships = [
    'Mother', 'Father', 'Brother', 'Sister', 'Friend', 'Landlord', 
    'Milkman', 'Relative', 'Employee', 'Customer', 'Partner', 'Others'
  ];

  useEffect(() => {
    if (currentPerson) {
      setName(currentPerson.name);
      setRelationship(currentPerson.relationship);
      setPhone(currentPerson.phone || '');
      setNotes(currentPerson.notes || '');
      setAvatarColor(currentPerson.avatarColor || '#6C63FF');
    }
  }, [currentPerson]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const data = { name, relationship, phone, notes, avatarColor };

    if (isEdit) {
      updatePerson(personId, data);
    } else {
      addPerson(data);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-body" style={{ padding: 0 }}>
      {/* Name */}
      <div className="form-group">
        <label htmlFor="p-name">Full Name</label>
        <input
          id="p-name"
          type="text"
          className="clay-input"
          placeholder="e.g. Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        {/* Relationship */}
        <div className="form-group">
          <label htmlFor="p-relationship">Relationship</label>
          <select
            id="p-relationship"
            className="clay-input clay-select"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            {relationships.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="p-phone">Phone (Optional)</label>
          <input
            id="p-phone"
            type="tel"
            className="clay-input"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Avatar Color Picker */}
      <div className="form-group">
        <label>Avatar Color</label>
        <div className="color-picker-grid">
          {avatarColors.map((colorVal) => (
            <div
              key={colorVal}
              className={`color-option ${avatarColor === colorVal ? 'selected' : ''}`}
              style={{ backgroundColor: colorVal }}
              onClick={() => setAvatarColor(colorVal)}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label htmlFor="p-notes">Notes</label>
        <input
          id="p-notes"
          type="text"
          className="clay-input"
          placeholder="e.g. Monthly rent receiver, college roommate"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="clay-button secondary clay-button-pill" onClick={onSubmitSuccess}>
          Cancel
        </button>
        <button type="submit" className="clay-button primary clay-button-pill">
          {isEdit ? 'Save Changes' : 'Add Person'}
        </button>
      </div>
    </form>
  );
};

export default PersonForm;
