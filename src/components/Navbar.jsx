import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    window.location.reload();
  };

  const isActive = (path) => {
    if (path.includes('type=farmer')) {
      return location.pathname === '/login' && location.search.includes('type=farmer');
    }
    if (path.includes('type=company')) {
      return location.pathname === '/login' && location.search.includes('type=company');
    }
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin-login';
    }
    return location.pathname === path;
  };

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      zIndex: 100, 
      backgroundColor: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '16px 32px', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      boxSizing: 'border-box'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', textDecoration: 'none' }}>
        Krishi Connect
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.95rem', fontWeight: 500 }}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        <Link to="/marketplace" className={`nav-link ${isActive('/marketplace') ? 'active' : ''}`}>Marketplace</Link>
        <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
        <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
        <Link to="/login?type=farmer" className={`nav-link ${isActive('/login?type=farmer') ? 'active' : ''}`}>Farmer Login</Link>
        <Link to="/login?type=company" className={`nav-link ${isActive('/login?type=company') ? 'active' : ''}`}>Company Login</Link>
        {currentUser && (
          <button 
            onClick={handleLogout} 
            style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
          >
            Logout ({currentUser.name})
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
