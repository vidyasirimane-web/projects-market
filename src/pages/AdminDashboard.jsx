import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, MessageSquare, UserPlus, MapPin, Phone, LogOut, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || '/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Using activeFilter to represent both the tab and the filter for users
  const [activeFilter, setActiveFilter] = useState('farmers');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [usersRes, productsRes] = await Promise.all([
        fetch(`${API}/users`),
        fetch(`${API}/products`)
      ]);
      const usersData = await usersRes.json();
      const productsData = await productsRes.json();
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/admin-login');
  };

  const pushNotification = (farmerPhone, message) => {
    const key = `notifications_${farmerPhone}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { message, timestamp: Date.now() }];
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(updated) }));
  };

  const handleApprove = async (product) => {
    try {
      await fetch(`${API}/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      pushNotification(product.farmerPhone, `${product.name} has been approved`);
      loadData();
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (product) => {
    try {
      await fetch(`${API}/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      pushNotification(product.farmerPhone, `${product.name} has been rejected`);
      loadData();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleApproveUser = async (user) => {
    try {
      await fetch(`${API}/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      pushNotification(user.phone, `Your account has been approved by the admin. You can now upload crops.`);
      loadData();
    } catch (err) {
      console.error('Approve user error:', err);
    }
  };

  const handleRejectUser = async (user) => {
    try {
      await fetch(`${API}/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      pushNotification(user.phone, `Your account registration was rejected.`);
      loadData();
    } catch (err) {
      console.error('Reject user error:', err);
    }
  };

  // Calculate dynamic counts
  const farmersCount = users.filter(u => u.type === 'farmer').length;
  const companiesCount = users.filter(u => u.type === 'company').length;
  const verifiedCount = users.filter(u => u.status === 'approved').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;

  // Filtered users for the list
  const displayedUsers = users.filter(u => {
    if (activeFilter === 'farmers') return u.type === 'farmer';
    if (activeFilter === 'companies') return u.type === 'company';
    if (activeFilter === 'verified') return u.status === 'approved';
    if (activeFilter === 'pending') return u.status === 'pending';
    return true;
  });

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>Loading Admin Control Center...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '100px 24px 40px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.02em' }}>Admin Control Center</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>System oversight & Verification Management</p>
          </div>
          <button onClick={handleLogout} style={{ 
            padding: '8px 20px', 
            borderRadius: '8px', 
            border: '1.5px solid #10b981', 
            background: 'transparent', 
            color: '#10b981', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Left Sidebar (Filters + Notes) */}
          <div style={{ width: '380px', flexShrink: 0 }}>
            {/* Management Filters Card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#64748b', marginBottom: '20px' }}>Management Filters</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setActiveFilter('farmers')} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '12px', border: '1px solid #10b981',
                  background: activeFilter === 'farmers' ? '#10b981' : '#f8fafc',
                  color: activeFilter === 'farmers' ? 'white' : '#1e293b',
                  cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', transition: 'all 0.2s', borderColor: activeFilter === 'farmers' ? '#10b981' : '#e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Users size={18} style={{ marginRight: '16px' }} /> Registered Farmers
                  </div>
                  <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>{farmersCount}</span>
                </button>

                <button onClick={() => setActiveFilter('companies')} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: activeFilter === 'companies' ? '#10b981' : '#f8fafc',
                  color: activeFilter === 'companies' ? 'white' : '#1e293b',
                  cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', transition: 'all 0.2s', borderColor: activeFilter === 'companies' ? '#10b981' : '#e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Package size={18} style={{ marginRight: '16px' }} /> Registered Companies
                  </div>
                  <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>{companiesCount}</span>
                </button>

                <button onClick={() => setActiveFilter('verified')} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: activeFilter === 'verified' ? '#10b981' : '#f0fdf4',
                  color: activeFilter === 'verified' ? 'white' : '#1e293b',
                  cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', transition: 'all 0.2s', borderColor: activeFilter === 'verified' ? '#10b981' : '#e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ShieldCheck size={18} style={{ marginRight: '16px' }} /> Verified Partners
                  </div>
                  <span style={{ fontWeight: '900', fontSize: '0.9rem', color: activeFilter === 'verified' ? 'white' : '#10b981' }}>{verifiedCount}</span>
                </button>

                <button onClick={() => setActiveFilter('pending')} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: activeFilter === 'pending' ? '#10b981' : '#fffbeb',
                  color: activeFilter === 'pending' ? 'white' : '#1e293b',
                  cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', transition: 'all 0.2s', borderColor: activeFilter === 'pending' ? '#10b981' : '#e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AlertCircle size={18} style={{ marginRight: '16px' }} /> Pending Review
                  </div>
                  <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>{pendingCount}</span>
                </button>
              </div>
            </div>

            {/* Admin Note */}
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '24px', color: 'white', border: '1px solid #1e293b' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>Admin Note</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>Always verify the physical ID documents uploaded by farmers before approving for bulk trade.</p>
            </div>
            
            {/* Action to still access products */}
            <button onClick={() => setActiveFilter('products')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px dashed #cbd5e1',
              background: activeFilter === 'products' ? '#1e293b' : 'transparent',
              color: activeFilter === 'products' ? 'white' : '#64748b',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s', marginTop: '24px'
            }}>
              <ShieldCheck size={18} style={{ marginRight: '8px' }} /> View Product Verifications ({products.length})
            </button>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <AnimatePresence mode="wait">
              
              {/* Product View (If Selected) */}
              {activeFilter === 'products' ? (
                <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>Product Verifications</h2>
                    <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1rem' }}>{products.length} total</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {products.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No products available.</p>
                    ) : (
                      products.map(p => (
                        <div key={p.id} style={{ 
                          display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '16px', 
                          border: '1px solid #e2e8f0', background: '#fafafa', gap: '20px', justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0' }}>
                              {p.image ? (
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={24} color="#94a3b8" /></div>
                              )}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>{p.name}</h3>
                              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>₹{p.price}/kg • {p.stock} kg • Farmer: {p.farmerName}</p>
                            </div>
                          </div>
                          
                          <div>
                            {p.status === 'Approved' ? (
                              <span style={{ background: '#d1fae5', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>Approved</span>
                            ) : p.status === 'Rejected' ? (
                              <span style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>Rejected</span>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleApprove(p)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
                                <button onClick={() => handleReject(p)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Dynamic Users List View */
                <motion.div key="usersList" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', textTransform: 'capitalize' }}>
                      {activeFilter === 'verified' ? 'Verified Partners' : activeFilter === 'pending' ? 'Pending Review' : `${activeFilter} List`}
                    </h2>
                    <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1rem' }}>{displayedUsers.length} total</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayedUsers.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No {activeFilter} found.</p>
                    ) : (
                      displayedUsers.map(user => (
                        <div key={user.id} style={{ 
                          display: 'flex', alignItems: 'flex-start', padding: '24px', borderRadius: '16px', 
                          border: '1px solid #e2e8f0', background: '#fafafa', gap: '20px' 
                        }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={24} color="#64748b" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{user.name}</h3>
                              <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>{user.type}</span>
                              {user.status === 'approved' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  <ShieldCheck size={12} /> Verified
                                </span>
                              ) : user.status === 'rejected' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  Rejected
                                </span>
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  Pending
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {user.village || 'Unknown'}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> {user.phone}</span>
                            </div>
                          </div>
                          {user.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleApproveUser(user)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>Approve</button>
                              <button onClick={() => handleRejectUser(user)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>Reject</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
