import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Truck, IndianRupee, Search, Star, Package, Clock,
  X, TrendingUp, CheckCircle, RefreshCw, Loader2, Building2, LogOut,
  Filter, BarChart2, MapPin, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = `http://${window.location.hostname}:5000/api`;

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>{icon}</div>
    <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em' }}>{value}</p>
  </div>
);

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderQty, setOrderQty] = useState(100);
  const [placing, setPlacing] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user || user.type !== 'company') { navigate('/login?type=company'); return; }
    setUserData(user);
  }, [navigate]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      if (userData) {
        const uRes = await fetch(`${API}/users/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: userData.phone, type: userData.type })
        });
        if (uRes.ok) {
          const u = await uRes.json();
          setUserData(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
        }
      }

      const [pRes, oRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/orders`),
      ]);
      const allProducts = await pRes.json();
      const allOrders = await oRes.json();
      setProducts(Array.isArray(allProducts) ? allProducts : []);
      setOrders(Array.isArray(allOrders) ? allOrders : []);
    } catch (err) {
      console.error('Load error:', err);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (userData) loadData(); }, [userData, loadData]);

  const handleLogout = () => { localStorage.removeItem('currentUser'); navigate('/login?type=company'); };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.farmerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.village || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(p => !['organic tomato','premium potato'].includes(p.name.toLowerCase()));

  const confirmOrder = async () => {
    if (!paymentMethod) { alert('Please select a payment method'); return; }
    setPlacing(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct.name,
          farmerName: selectedProduct.farmerName || 'Local Farmer',
          companyName: userData?.name || 'Company',
          quantity: parseInt(orderQty),
          totalPrice: selectedProduct.price * parseInt(orderQty),
          paymentMethod,
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      setShowCheckout(false); setSelectedProduct(null); setPaymentMethod(''); setOrderQty(100);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadData();
// Notify farmer of new order
const notifKey = `notifications_${selectedProduct.farmerPhone}`;
const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
existing.push({ type: 'order', productId: selectedProduct.id, message: `Your product ${selectedProduct.name} has a new order.` });
localStorage.setItem(notifKey, JSON.stringify(existing));
window.dispatchEvent(new StorageEvent('storage', { key: notifKey, newValue: JSON.stringify(existing) }));
      setActiveTab('orders');
    } catch (err) { alert(err.message); }
    finally { setPlacing(false); }
  };

  const handleApprove = async (product) => {
  try {
    const res = await fetch(`${API}/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' }),
    });
    if (!res.ok) throw new Error('Approve failed');
    // Add notification for farmer
    const notifKey = `notifications_${product.farmerPhone}`;
    const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
    existing.push({ type: 'approval', productId: product.id, message: `Your product ${product.name} was approved.` });
    localStorage.setItem(notifKey, JSON.stringify(existing));
    window.dispatchEvent(new StorageEvent('storage', { key: notifKey, newValue: JSON.stringify(existing) }));
    await loadData();
  } catch (err) {
    console.error(err);
    alert('Unable to approve product');
  }
};

const handleReject = async (product) => {
  try {
    const res = await fetch(`${API}/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' }),
    });
    if (!res.ok) throw new Error('Reject failed');
    // Add notification for farmer
    const notifKey = `notifications_${product.farmerPhone}`;
    const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
    existing.push({ type: 'rejection', productId: product.id, message: `Your product ${product.name} was rejected.` });
    localStorage.setItem(notifKey, JSON.stringify(existing));
    window.dispatchEvent(new StorageEvent('storage', { key: notifKey, newValue: JSON.stringify(existing) }));
    await loadData();
  } catch (err) {
    console.error(err);
    alert('Unable to reject product');
  }
};

const totalSpend = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const activeOrders = orders.filter(o => o.status === 'Processing' || o.status === 'In Transit').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;

  const statusOrder = ['Order Placed', 'Processing', 'In Transit', 'Delivered'];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff' }}>
      <p style={{ color: '#2563eb', fontWeight: '700', fontSize: '1rem' }}>Loading portal...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '68px' }}>
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: '90px', right: '24px', zIndex: 999, padding: '16px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 16px 48px rgba(0,0,0,0.15)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} color="#16a34a" />
            <p style={{ fontWeight: '700', color: '#0f172a' }}>Order placed successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} color="white" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em' }}>Company <span style={{ color: '#2563eb' }}>Portal</span></h1>
                  <span style={{ padding: '2px 8px', background: userData?.status === 'approved' ? '#dbeafe' : '#fef3c7', color: userData?.status === 'approved' ? '#2563eb' : '#d97706', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>
                    {userData?.status === 'approved' ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{userData?.name} · Direct Farm Procurement</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px 20px', background: '#eff6ff', borderRadius: '14px', border: '1px solid #bfdbfe', textAlign: 'right' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Total Spend</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1d4ed8' }}>₹{totalSpend.toLocaleString()}</p>
            </div>
            <button onClick={() => loadData()} disabled={refreshing} style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.8rem', color: '#64748b', fontFamily: 'inherit' }}>
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={handleLogout} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
          <StatCard icon={<IndianRupee size={20} color="#2563eb" />} label="Total Spend" value={`₹${totalSpend.toLocaleString()}`} color="#2563eb" bg="#dbeafe" />
          <StatCard icon={<Package size={20} color="#16a34a" />} label="Available Crops" value={products.length} color="#16a34a" bg="#dcfce7" />
          <StatCard icon={<Clock size={20} color="#f59e0b" />} label="Active Orders" value={activeOrders} color="#f59e0b" bg="#fef3c7" />
          <StatCard icon={<CheckCircle size={20} color="#10b981" />} label="Delivered" value={delivered} color="#10b981" bg="#d1fae5" />
        </div>

        {/* Tabs */}
        <div className="tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'white', padding: '6px', borderRadius: '16px', border: '1px solid #e2e8f0', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {[
            { id: 'browse', label: 'Browse Crops', icon: <Search size={16} />, count: products.length },
            { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={16} />, count: orders.length },
            { id: 'history', label: 'History', icon: <Clock size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
              }}>
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '900', background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: activeTab === tab.id ? 'white' : '#64748b' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* BROWSE */}
          {activeTab === 'browse' && (
            <motion.div key="browse" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '440px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder="Search by crop, farmer or village..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '16px', padding: '13px 16px 13px 44px', borderRadius: '14px', border: '1.5px solid #e2e8f0', outline: 'none', width: '100%', fontSize: '0.875rem', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                  <Search size={64} style={{ margin: '0 auto 16px', strokeWidth: 1 }} />
                  <p style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '8px' }}>No crops available</p>
                  <p style={{ fontSize: '0.875rem' }}>Farmers haven't listed any products yet. Check back soon.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {filteredProducts.map(p => (
                    <motion.div key={p.id} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                      style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.3s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
                        {p.image
                          ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}><Package size={48} strokeWidth={1} /></div>
                        }
                        <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 10px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderRadius: '999px', fontSize: '0.68rem', fontWeight: '800', color: '#2563eb' }}>
                          📍 {p.village || 'India'}
                        </div>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px', background: 'rgba(22,163,74,0.9)', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '800', color: 'white' }}>
                          Grade {p.quality || 'A+'}
                        </div>
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#16a34a' }}>₹{p.price}</span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>/ {p.unit}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Farmer</p>
                            <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{p.farmerName || 'Local Farmer'}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '0.78rem', fontWeight: '800' }}>
                            <Star size={13} fill="currentColor" /> 4.8
                          </div>
                        </div>
                        <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Stock</span>
                          <span style={{ color: '#0f172a', fontWeight: '800' }}>{p.stock || 'N/A'} {p.unit}</span>
                        </div>
                        {p.status === 'Approved' ? (
                          <div style={{ padding: '8px', background: '#d1fae5', borderRadius: '8px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>Approved</div>
                        ) : p.status === 'Rejected' ? (
                          <div style={{ padding: '8px', background: '#fef2f2', borderRadius: '8px', textAlign: 'center', color: '#ef4444', fontWeight: '600' }}>Rejected</div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button onClick={() => { setSelectedProduct(p); setShowCheckout(true); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Buy Now</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                  <ShoppingBag size={64} style={{ margin: '0 auto 16px', strokeWidth: 1 }} />
                  <p style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '8px' }}>No active orders</p>
                  <p style={{ fontSize: '0.875rem' }}>Browse the marketplace to place your first bulk order</p>
                  <button onClick={() => setActiveTab('browse')} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>Browse Crops</button>
                </div>
              ) : orders.map(order => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                      <img src={products.find(p => p.name === order.productName)?.image || 'https://images.unsplash.com/photo-1592919016350-f0c13cb96994?w=200'} alt={order.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>{order.productName}</h4>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px' }}>#{(order.id || '').toString().slice(-6)}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>From: <strong style={{ color: '#334155' }}>{order.farmerName}</strong> · {order.date}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    {[['Qty', `${order.quantity}kg`, '#0f172a'], ['Amount', `₹${(order.totalPrice || 0).toLocaleString()}`, '#2563eb'], ['Payment', order.paymentMethod || 'COD', '#64748b']].map(([label, val, color]) => (
                      <div key={label}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</p>
                        <p style={{ fontWeight: '900', color, fontSize: '0.9rem' }}>{val}</p>
                      </div>
                    ))}
                    <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'In Transit' ? '#dbeafe' : '#fef3c7', color: order.status === 'Delivered' ? '#16a34a' : order.status === 'In Transit' ? '#1d4ed8' : '#92400e' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {order.status || 'Processing'}
                    </span>
                    <button onClick={() => setTrackedOrder(order)}
                      style={{ padding: '10px 20px', borderRadius: '12px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; }} onMouseLeave={e => { e.currentTarget.style.background = '#0f172a'; }}>
                      <Truck size={15} /> Track
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
              <BarChart2 size={64} style={{ margin: '0 auto 16px', strokeWidth: 1 }} />
              <p style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '8px' }}>Procurement History</p>
              <p style={{ fontSize: '0.875rem' }}>Detailed analytics and past transactions coming soon</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontWeight: '900', fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Place Bulk Order</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Finalize procurement for {selectedProduct.name}</p>
                </div>
                <button onClick={() => setShowCheckout(false)} style={{ padding: '8px', borderRadius: '10px', border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '28px' }}>
                {/* Product Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', background: '#f8fafc', borderRadius: '18px', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{selectedProduct.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>₹{selectedProduct.price}/kg · Grade {selectedProduct.quality || 'A+'} · {selectedProduct.farmerName}</p>
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Order Quantity (kg)</label>
                  <input type="number" min="10" step="10" value={orderQty} onChange={e => setOrderQty(e.target.value)}
                    style={{ padding: '13px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', outline: 'none', width: '100%', fontSize: '1.1rem', fontWeight: '800', fontFamily: 'inherit' }} />
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                    Total: <strong style={{ color: '#2563eb', fontSize: '1rem' }}>₹{(selectedProduct.price * orderQty).toLocaleString()}</strong>
                  </p>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Payment Method</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ id: 'Cash on Delivery', label: 'Cash on Delivery', emoji: '💵' }, { id: 'Online Payment', label: 'Pay Online', emoji: '💳' }].map(opt => (
                      <button key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                        style={{ padding: '18px', borderRadius: '16px', border: `2px solid ${paymentMethod === opt.id ? '#2563eb' : '#e2e8f0'}`, background: paymentMethod === opt.id ? '#eff6ff' : 'white', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                        <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>{opt.emoji}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: paymentMethod === opt.id ? '#2563eb' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={confirmOrder} disabled={placing || !paymentMethod}
                  style={{ width: '100%', padding: '15px', borderRadius: '16px', background: paymentMethod ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#e2e8f0', color: paymentMethod ? 'white' : '#94a3b8', border: 'none', cursor: paymentMethod ? 'pointer' : 'not-allowed', fontWeight: '800', fontSize: '1rem', fontFamily: 'inherit', boxShadow: paymentMethod ? '0 8px 24px rgba(37,99,235,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {placing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Confirm Order →'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Track Shipment Modal */}
      <AnimatePresence>
        {trackedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={20} color="#2563eb" />
                  <h2 style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>Shipment Tracker</h2>
                </div>
                <button onClick={() => setTrackedOrder(null)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '24px 28px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Order</p>
                  <p style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', marginBottom: '2px' }}>{trackedOrder.productName}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>From: {trackedOrder.farmerName} · {trackedOrder.date}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {statusOrder.map((step, i) => {
                    const currentIdx = statusOrder.indexOf(trackedOrder.status || 'Processing');
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', background: isActive ? '#eff6ff' : '#f8fafc', border: `1px solid ${isActive ? '#bfdbfe' : '#f1f5f9'}`, opacity: isActive ? 1 : 0.5, transition: 'all 0.3s' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isActive ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isActive ? <CheckCircle size={18} color="white" /> : <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8' }}>{i + 1}</span>}
                        </div>
                        <span style={{ fontWeight: '700', color: isActive ? '#2563eb' : '#94a3b8', fontSize: '0.875rem', flex: 1 }}>{step}</span>
                        {isCurrent && <span style={{ padding: '3px 10px', background: '#2563eb', color: 'white', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>Now</span>}
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setTrackedOrder(null)} style={{ marginTop: '20px', width: '100%', padding: '13px', borderRadius: '14px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2563eb'} onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}>
                  Close Tracker
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .tabs-container { flex-direction: column !important; width: 100% !important; }
          .tabs-container button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;
