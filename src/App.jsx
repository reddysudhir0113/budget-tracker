import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BottomNav from './components/BottomNav';
import ToastContainer from './components/ToastContainer';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';

// Page imports
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import People from './pages/People';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

import { MdAdd } from 'react-icons/md';

const AppContent = () => {
  const [globalAddOpen, setGlobalAddOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Claymorphism Sidebar Navigation (Desktop/Tablet) */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <main className="main-content">
        <Topbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/people" element={<People />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        {/* Floating Action Add Button (Mobile & Desktop) */}
        <button 
          className="floating-add-btn" 
          onClick={() => setGlobalAddOpen(true)}
          aria-label="Add Transaction Quick Button"
        >
          <MdAdd />
        </button>

        {/* Global Toast Container */}
        <ToastContainer />
      </main>

      {/* Mobile Bottom Sticky Navigation */}
      <BottomNav />

      {/* Global Quick Add Transaction Modal */}
      <Modal 
        isOpen={globalAddOpen} 
        onClose={() => setGlobalAddOpen(false)} 
        title="Add Transaction"
      >
        <TransactionForm onSubmitSuccess={() => setGlobalAddOpen(false)} />
      </Modal>
    </div>
  );
};

function App() {
  return (
    <BudgetProvider>
      <Router>
        <AppContent />
      </Router>
    </BudgetProvider>
  );
}

export default App;
