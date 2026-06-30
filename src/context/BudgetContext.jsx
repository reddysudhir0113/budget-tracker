import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_PEOPLE, 
  DEFAULT_TRANSACTIONS, 
  DEFAULT_BUDGETS, 
  DEFAULT_SETTINGS 
} from '../constants/mockData';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  // Load state from local storage or fallback to default constants
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('bt_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [people, setPeople] = useState(() => {
    const saved = localStorage.getItem('bt_people');
    return saved ? JSON.parse(saved) : DEFAULT_PEOPLE;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('bt_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('bt_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('bt_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentMonth, setCurrentMonth] = useState('2026-07');
  const [toasts, setToasts] = useState([]);
  const [lastDeletedTransaction, setLastDeletedTransaction] = useState(null);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('bt_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bt_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('bt_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('bt_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('bt_settings', JSON.stringify(settings));
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  // Toast helper
  const addToast = (message, type = 'success', action = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Transaction CRUD Operations
  const addTransaction = (transaction) => {
    const newTx = {
      ...transaction,
      id: 't-' + Date.now(),
      amount: parseFloat(transaction.amount) || 0,
      status: transaction.status || 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addToast('Transaction added successfully!', 'success');
  };

  const updateTransaction = (id, updatedFields) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? { ...tx, ...updatedFields, amount: parseFloat(updatedFields.amount) || 0 }
          : tx
      )
    );
    addToast('Transaction updated successfully!', 'success');
  };

  const deleteTransaction = (id) => {
    const itemToDelete = transactions.find((tx) => tx.id === id);
    if (!itemToDelete) return;
    
    setLastDeletedTransaction(itemToDelete);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    
    addToast('Transaction deleted.', 'info', {
      label: 'Undo',
      onClick: () => {
        setTransactions((prev) => [itemToDelete, ...prev]);
        setLastDeletedTransaction(null);
        addToast('Transaction restored!', 'success');
      }
    });
  };

  // People CRUD Operations
  const addPerson = (person) => {
    const newPerson = {
      ...person,
      id: 'person-' + Date.now(),
      avatarColor: person.avatarColor || '#6C63FF',
    };
    setPeople((prev) => [...prev, newPerson]);
    addToast(`${person.name} added to people!`, 'success');
  };

  const updatePerson = (id, updatedFields) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    addToast('Person details updated!', 'success');
  };

  const deletePerson = (id) => {
    const person = people.find(p => p.id === id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
    addToast(`${person ? person.name : 'Person'} removed.`, 'info');
  };

  // Category CRUD Operations
  const addCategory = (category) => {
    const newCat = {
      ...category,
      id: 'cat-' + Date.now(),
      color: category.color || 'var(--others)',
    };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${category.name}" created!`, 'success');
  };

  const updateCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    addToast('Category updated!', 'success');
  };

  const deleteCategory = (id) => {
    const cat = categories.find(c => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast(`Category "${cat ? cat.name : ''}" deleted.`, 'info');
  };

  // Budget Goals Operations
  const updateBudget = (month, budgetFields) => {
    setBudgets((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        ...budgetFields,
      },
    }));
    addToast('Budget targets updated!', 'success');
  };

  // Settings Toggles
  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
    addToast('Settings saved successfully!', 'success');
  };

  // Backup Import/Export
  const exportData = () => {
    const dataStr = JSON.stringify({ transactions, people, categories, budgets, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `budget_tracker_backup_${currentMonth}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addToast('Data exported successfully!', 'success');
  };

  const importData = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.people) setPeople(parsed.people);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.budgets) setBudgets(parsed.budgets);
      if (parsed.settings) setSettings(parsed.settings);
      addToast('Data imported successfully!', 'success');
      return true;
    } catch (err) {
      addToast('Failed to import. Invalid JSON structure.', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    setPeople(DEFAULT_PEOPLE);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(DEFAULT_BUDGETS);
    setSettings(DEFAULT_SETTINGS);
    addToast('All data reset to defaults.', 'warning');
  };

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        people,
        categories,
        budgets,
        settings,
        currentMonth,
        toasts,
        setCurrentMonth,
        addToast,
        removeToast,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addPerson,
        updatePerson,
        deletePerson,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBudget,
        toggleTheme,
        updateSettings,
        exportData,
        importData,
        resetAllData,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
