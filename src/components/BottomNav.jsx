import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdOutlineDashboard, 
  MdOutlineCompareArrows, 
  MdOutlineCategory, 
  MdOutlineAssessment, 
  MdOutlineSettings 
} from 'react-icons/md';

const BottomNav = () => {
  const items = [
    { path: '/', label: 'Dashboard', icon: MdOutlineDashboard },
    { path: '/transactions', label: 'Transactions', icon: MdOutlineCompareArrows },
    { path: '/categories', label: 'Categories', icon: MdOutlineCategory },
    { path: '/reports', label: 'Reports', icon: MdOutlineAssessment },
    { path: '/settings', label: 'More', icon: MdOutlineSettings }
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink 
          key={item.path} 
          to={item.path} 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon className="bottom-nav-icon" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
