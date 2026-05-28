import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, TrendingUp, Clock, CheckCircle, XCircle, LayoutDashboard,
  Camera, Loader2, Sparkles, ShieldCheck, Bell, MessageSquare, Trash2,
  RefreshCw, AlertCircle, IndianRupee, Star, BarChart2, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || '/api';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '20px 20px 0 0' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
    </div>
    <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em' }}>{value}</p>
  </div>
);

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  // Load farmer-specific notifications from localStorage
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (userData?.phone) {
      const notifKey = `notifications_${userData.phone}`;
      const stored = JSON.parse(localStorage.getItem(notifKey) || '[]');
      setNotifications(stored);
    }
  }, [userData]);

  // Listen for notifications updates via storage events
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === `notifications_${userData?.phone}`) {
        const stored = JSON.parse(e.newValue || '[]');
        setNotifications(stored);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userData?.phone]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', quantity: '', quality: '' });
  const loadData = useCallback(async (user) => {
    if (!user) return;
    setRefreshing(true);
    try {
      const uRes = await fetch(`${API}/users/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, type: user.type })
      });
      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
        localStorage.setItem('currentUser', JSON.stringify(u));
      }

      // Load products for this farmer
      const pRes = await fetch(`${API}/products/farmer/${user.phone}`);
      const products = await pRes.json();
      setMyProducts(Array.isArray(products) ? products : []);

      // Load all orders
      const oRes = await fetch(`${API}/orders`);
      const allOrders = await oRes.json();
      const myOrders = Array.isArray(allOrders)
        ? allOrders.filter(o => products.some(p => p.name === o.productName))
        : [];
      setOrders(myOrders);

      // Load chats from localStorage (chat not in DB yet)
      const savedChats = JSON.parse(localStorage.getItem('farmerChats') || '[]');
      setChats(savedChats.filter(c => c.farmerPhone === user.phone));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load current user and initial data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user || user.type !== 'farmer') { navigate('/login?type=farmer'); return; }
    setUserData(user);
    
    // Only call loadData once on initial load (since loadData is stable via useCallback)
    loadData(user);
  }, [navigate, loadData]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login?type=farmer');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); detectCrop(reader.result); };
    reader.readAsDataURL(file);
  };

  const detectCrop = async (imageData) => {
    setIsDetecting(true);
    setDetectionResults(null);
    try {
      const response = await fetch(`${API}/detect-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      const result = await response.json();
      const { name, quality, health, suggested_price } = result;
      const data = { name: name || 'Detected Crop', health: health || 'Good', quality: quality || 'A+', suggested_price };
      setDetectionResults(data);
      setForm(prev => ({
        ...prev,
        name: data.name,
        price: data.suggested_price ? data.suggested_price.toString() : '',
        quality: data.quality
      }));
    } catch (err) {
      console.error('AI detection error:', err);
      const fallback = { name: 'Detected Crop', health: 'Good', quality: 'A+', suggested_price: 45 };
      setDetectionResults(fallback);
      setForm(prev => ({
        ...prev,
        name: fallback.name,
        price: fallback.suggested_price.toString(),
        quality: fallback.quality
      }));
    } finally {
      setIsDetecting(false);
    }
  };

  const resetForm = () => { setPreview(null); setDetectionResults(null); setForm({ name: '', price: '', quantity: '', quality: '' }); setIsDetecting(false); };

  const handleAddProduct = async (status = 'Unverified') => {
    if (!form.name || !form.price || !form.quantity) { alert('Please fill Name, Price and Quantity.'); return; }
    setSavingProduct(true);
    try {
      const res = await fetch(`${API}/products`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, price: parseFloat(form.price), stock: parseInt(form.quantity),
          quality: form.quality || 'A+', health: detectionResults?.health || 'Good',
          unit: 'kg', category: 'Vegetables', status,
          image: preview || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
          farmerName: userData.name, farmerPhone: userData.phone, village: userData.village || 'India',
        }),
      });
      if (!res.ok) throw new Error('Failed to save product');
      setShowAddForm(false); resetForm();
      await loadData(userData);
    } catch (err) { alert(err.message); }
    finally { setSavingProduct(false); }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'Hold' ? 'Unverified' : 'Hold';
    try {
      await fetch(`${API}/products/${product.id}/verify`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setMyProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch (err) { alert('Failed to update status'); }
  };

  const handleSendReply = (chatId) => {
    const text = replyText[chatId];
    if (!text?.trim()) return;
    const all = JSON.parse(localStorage.getItem('farmerChats') || '[]');
    const updated = all.map(c => c.id === chatId
      ? { ...c, replies: [...(c.replies || []), { id: Date.now(), sender: userData.name, message: text.trim(), timestamp: new Date().toLocaleString() }] }
      : c);
    localStorage.setItem('farmerChats', JSON.stringify(updated));
    setReplyText(prev => ({ ...prev, [chatId]: '' }));
    setChats(updated.filter(c => c.farmerPhone === userData.phone));
  };

  const handleDeleteChat = (chatId) => {
    if (!window.confirm('Delete this chat thread?')) return;
    const updated = JSON.parse(localStorage.getItem('farmerChats') || '[]').filter(c => c.id !== chatId);
    localStorage.setItem('farmerChats', JSON.stringify(updated));
    setChats(updated.filter(c => c.farmerPhone === userData.phone));
  };

  const earnings = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const activeOrders = orders.filter(o => o.status === 'Processing' || o.status === 'In Transit').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'My Products', icon: <Package size={18} />, badge: myProducts.length },
    { id: 'orders', label: 'Orders', icon: <Clock size={18} />, badge: orders.length },
    { id: 'chats', label: 'Messages', icon: <MessageSquare size={18} />, badge: chats.length },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#f0fdf4' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} color="white" className="animate-spin" />
      </div>
      <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '1rem' }}>Loading your dashboard...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', paddingTop: '80px' }}>
      {/* Top Header Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em' }}>Farmer Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Welcome back, </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#16a34a' }}>{userData?.name || 'Farmer'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: userData?.status === 'approved' ? '#dcfce7' : '#fef3c7', color: userData?.status === 'approved' ? '#16a34a' : '#d97706', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                {userData?.status === 'approved' ? <ShieldCheck size={10} /> : <AlertCircle size={10} />}
                {userData?.status === 'approved' ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => loadData(userData)} disabled={refreshing} style={{ padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.8rem', color: '#64748b', fontFamily: 'inherit' }}>
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={{ padding: '9px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', position: 'relative' }}>
                <Bell size={18} />
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#16a34a', borderRadius: '50%', border: '2px solid white', fontSize: '9px', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length}</span>
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifications(false)} />
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
                      style={{ position: 'absolute', right: 0, top: '44px', width: '320px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: '20px', zIndex: 50 }}>
                      <p style={{ fontWeight: '800', marginBottom: '12px', fontSize: '0.875rem' }}>Notifications</p>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: '#64748b', padding: '10px' }}>No new notifications</p>
                      ) : (
                        notifications.map((n, idx) => (
                          <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: '0.8rem', color: '#0f172a' }}>{n.message}</p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {userData?.status === 'approved' ? (
              <button onClick={() => setShowAddForm(true)} style={{ padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', fontFamily: 'inherit' }}>
                <Plus size={18} /> Upload Crop
              </button>
            ) : (
              <button disabled style={{ padding: '10px 20px', borderRadius: '12px', background: '#e2e8f0', color: '#94a3b8', border: 'none', cursor: 'not-allowed', fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
                <AlertCircle size={18} /> Pending Approval
              </button>
            )}
            <button onClick={handleLogout} style={{ padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats Row */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
          <StatCard icon={<IndianRupee size={20} color="#16a34a" />} label="Total Earnings" value={`₹${earnings.toLocaleString()}`} color="#16a34a" bg="#dcfce7" />
          <StatCard icon={<Package size={20} color="#3b82f6" />} label="Products Listed" value={myProducts.length} color="#3b82f6" bg="#dbeafe" />
          <StatCard icon={<Clock size={20} color="#f59e0b" />} label="Active Orders" value={activeOrders} color="#f59e0b" bg="#fef3c7" />
          <StatCard icon={<CheckCircle size={20} color="#10b981" />} label="Completed" value={completedOrders} color="#10b981" bg="#d1fae5" />
        </div>

        <div className="main-layout" style={{ display: 'flex', gap: '24px' }}>
          {/* Sidebar */}
          <aside className="sidebar-nav" style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '13px 16px',
                  borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit',
                  background: activeTab === tab.id ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'white',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                  boxShadow: activeTab === tab.id ? '0 6px 20px rgba(22,163,74,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{tab.icon} {tab.label}</span>
                {tab.badge > 0 && (
                  <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '900', background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#dcfce7', color: activeTab === tab.id ? 'white' : '#16a34a' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <LayoutDashboard size={18} color="#16a34a" />
                      <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>Account Overview</h3>
                    </div>
                    <div className="overview-grid" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {[
                        { label: 'Full Name', value: userData?.name || 'N/A' },
                        { label: 'Village', value: userData?.village || 'N/A' },
                        { label: 'Phone', value: `+91 ${userData?.phone || 'N/A'}` },
                        { label: 'Account Status', value: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: '#dcfce7', color: '#16a34a', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}><ShieldCheck size={12} /> Verified & Active</span> },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                          <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</p>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{value}</div>
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / -1', padding: '18px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: '14px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Products Listed</p>
                          <p style={{ fontSize: '2rem', fontWeight: '900', color: '#16a34a' }}>{myProducts.length} <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>products active</span></p>
                        </div>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
                          <BarChart2 size={28} color="#16a34a" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PRODUCTS */}
              {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={18} color="#16a34a" />
                        <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>My Products</h3>
                      </div>
                      <span style={{ padding: '4px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>{myProducts.length} Items</span>
                    </div>
                    <div style={{ padding: '20px' }}>
                      {myProducts.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                          <Package size={56} style={{ margin: '0 auto 16px', strokeWidth: 1 }} />
                          <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>No products uploaded yet</p>
                          <p style={{ fontSize: '0.875rem' }}>Click "Upload Crop" to list your first product</p>
                          <button onClick={() => setShowAddForm(true)} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>
                            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Upload First Crop
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                          {myProducts.map(p => (
                            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                              style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}
                              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f8fafc' }}>
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                  onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; }} onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                                />
                                <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: p.status === 'Hold' ? '#fef3c7' : p.status === 'Approved' ? '#dcfce7' : '#dbeafe', color: p.status === 'Hold' ? '#92400e' : p.status === 'Approved' ? '#16a34a' : '#1d4ed8' }}>
                                  {p.status === 'Hold' ? '⏸ On Hold' : p.status === 'Approved' ? '✅ Approved' : '🔄 Live'}
                                </div>
                              </div>
                              <div style={{ padding: '14px' }}>
                                <h4 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
                                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#16a34a' }}>₹{p.price}</span>
                                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>/ {p.unit}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '10px', background: '#f8fafc', borderRadius: '10px', marginBottom: '10px', fontSize: '0.75rem' }}>
                                  <div><span style={{ color: '#94a3b8', fontWeight: '700' }}>Stock: </span><span style={{ fontWeight: '800', color: '#0f172a' }}>{p.stock}kg</span></div>
                                  <div><span style={{ color: '#94a3b8', fontWeight: '700' }}>Grade: </span><span style={{ fontWeight: '800', color: '#16a34a' }}>{p.quality}</span></div>
                                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '800' }}><Star size={12} fill="currentColor" /> {p.rating || '4.5'}</div>
                                </div>
                                <button onClick={() => handleToggleStatus(p)}
                                  style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', color: '#64748b', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                >
                                  {p.status === 'Hold' ? '🟢 Set Live' : '⏸ Put on Hold'}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={18} color="#16a34a" />
                      <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>Incoming Orders</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {orders.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                          <Clock size={56} style={{ margin: '0 auto 16px', strokeWidth: 1 }} />
                          <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>No orders yet</p>
                          <p style={{ fontSize: '0.875rem' }}>When companies order your products, they'll appear here</p>
                        </div>
                      ) : orders.map(order => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                          <div>
                            <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>{order.productName}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>By: <strong>{order.companyName}</strong> · {order.date}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Qty</p>
                              <p style={{ fontWeight: '900', color: '#0f172a' }}>{order.quantity}kg</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Amount</p>
                              <p style={{ fontWeight: '900', color: '#16a34a' }}>₹{(order.totalPrice || 0).toLocaleString()}</p>
                            </div>
                            <span style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'In Transit' ? '#dbeafe' : '#fef3c7', color: order.status === 'Delivered' ? '#16a34a' : order.status === 'In Transit' ? '#1d4ed8' : '#92400e' }}>
                              {order.status || 'Processing'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CHATS */}
              {activeTab === 'chats' && (
                <motion.div key="chats" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={18} color="#16a34a" />
                        <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>Buyer Messages</h3>
                      </div>
                      <span style={{ padding: '4px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>{chats.length} Threads</span>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {chats.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                          <MessageSquare size={56} style={{ margin: '0 auto 16px', strokeWidth: 1 }} />
                          <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>No buyer messages yet</p>
                          <p style={{ fontSize: '0.875rem' }}>Buyer inquiries from the marketplace appear here</p>
                        </div>
                      ) : chats.map(chat => (
                        <motion.div key={chat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          style={{ padding: '20px', background: '#f8fafc', borderRadius: '18px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                              <span style={{ display: 'inline-block', padding: '2px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '999px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Re: {chat.productName}</span>
                              <h4 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{chat.senderName}</h4>
                              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{chat.timestamp}</p>
                            </div>
                            <button onClick={() => handleDeleteChat(chat.id)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div style={{ padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Inquiry</p>
                            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.6' }}>{chat.message}</p>
                          </div>
                          {chat.replies?.length > 0 && (
                            <div style={{ paddingLeft: '16px', borderLeft: '2px solid #bbf7d0', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {chat.replies.map(r => (
                                <div key={r.id} style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: '800', color: '#16a34a' }}>{r.sender}</span>
                                  <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: '6px' }}>({r.timestamp})</span>
                                  <p style={{ color: '#334155', marginTop: '2px' }}>{r.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Write a reply..." value={replyText[chat.id] || ''}
                              onChange={e => setReplyText(prev => ({ ...prev, [chat.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') handleSendReply(chat.id); }}
                              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.875rem' }} />
                            <button onClick={() => handleSendReply(chat.id)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                              Reply
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '680px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={18} color="white" />
                  </div>
                  <h2 style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>AI Crop Detector & Upload</h2>
                </div>
                <button onClick={() => { setShowAddForm(false); resetForm(); }} style={{ padding: '8px', borderRadius: '10px', border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                  <XCircle size={22} />
                </button>
              </div>
              <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                {/* Left: Image */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Crop Photo</p>
                  {preview ? (
                    <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', border: '3px solid #bbf7d0', aspectRatio: '1', background: '#f8fafc' }}>
                      <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isDetecting && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'white' }}>
                          <Loader2 size={40} className="animate-spin" />
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>AI Detecting...</span>
                        </div>
                      )}
                      <button onClick={() => { setPreview(null); setDetectionResults(null); }} style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px 12px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', fontFamily: 'inherit' }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px', border: '2px dashed #e2e8f0', borderRadius: '18px', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', aspectRatio: '1' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0fdf4'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}>
                      <Camera size={40} color="#94a3b8" strokeWidth={1.5} />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Upload Crop Photo</p>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>AI will auto-fill details</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                    </label>
                  )}
                  {detectionResults && (
                    <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', marginBottom: '2px' }}>AI Result</p>
                        <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>{detectionResults.name} · {detectionResults.health}</p>
                      </div>
                      <span style={{ padding: '3px 10px', background: '#16a34a', color: 'white', borderRadius: '999px', fontSize: '0.68rem', fontWeight: '800' }}>AI ✓</span>
                    </div>
                  )}
                </div>

                {/* Right: Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Crop Details</p>
                  {[{ label: 'Crop Name *', field: 'name', placeholder: 'e.g. Organic Tomato', type: 'text' },
                    { label: 'Price per kg (₹) *', field: 'price', placeholder: 'e.g. 55', type: 'number' },
                    { label: 'Quantity (kg) *', field: 'quantity', placeholder: 'e.g. 500', type: 'number' },
                    { label: 'Quality Grade', field: 'quality', placeholder: 'e.g. A+, A, B', type: 'text' },
                  ].map(({ label, field, placeholder, type }) => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>{label}</label>
                      <input type={type} placeholder={placeholder} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                        style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', fontWeight: '600', width: '100%', fontFamily: 'inherit' }} />
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                    <button onClick={() => { setShowAddForm(false); resetForm(); }} style={{ padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', color: '#64748b', fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={() => handleAddProduct('Hold')} disabled={savingProduct} style={{ padding: '11px', borderRadius: '10px', border: '1.5px solid #f59e0b', background: '#fffbeb', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', color: '#92400e', fontFamily: 'inherit' }}>
                      {savingProduct ? '...' : 'Hold'}
                    </button>
                    <button onClick={() => handleAddProduct('Unverified')} disabled={savingProduct} style={{ padding: '11px', borderRadius: '10px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', fontFamily: 'inherit' }}>
                      {savingProduct ? <Loader2 size={14} className="animate-spin" /> : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-layout { flex-direction: column !important; }
          .sidebar-nav { width: 100% !important; flex-direction: row !important; overflow-x: auto; }
          .overview-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .sidebar-nav button { padding: 10px !important; font-size: 0.75rem !important; }
        }
      `}</style>
    </div>
  );
};

export default FarmerDashboard;
