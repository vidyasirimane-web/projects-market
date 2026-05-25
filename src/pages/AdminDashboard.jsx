import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all products from backend
  const loadProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Helper to push a notification for a farmer
  const pushNotification = (farmerPhone, message) => {
    const key = `notifications_${farmerPhone}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { message, timestamp: Date.now() }];
    localStorage.setItem(key, JSON.stringify(updated));
    // Dispatch event so any listening component can react immediately
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(updated) }));
  };

  const handleApprove = async (product) => {
    try {
      await fetch(`http://localhost:5000/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      // Notify farmer
      pushNotification(product.farmerPhone, `${product.name} has been approved`);
      // Refresh list to reflect new status
      loadProducts();
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (product) => {
    try {
      await fetch(`http://localhost:5000/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      // Notify farmer
      pushNotification(product.farmerPhone, `${product.name} has been rejected`);
      loadProducts();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const renderStatus = (product) => {
    if (product.status === 'Approved') {
      return <span style={{ background: '#d1fae5', color: '#10b981', padding: '4px 8px', borderRadius: '6px' }}>Approved</span>;
    }
    if (product.status === 'Rejected') {
      return <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px' }}>Rejected</span>;
    }
    return (
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={() => handleApprove(product)} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px' }}>Approve</button>
        <button onClick={() => handleReject(product)} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px' }}>Reject</button>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading admin dashboard…</div>;

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '20px' }}>Admin Dashboard – All Products</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
            <div style={{ padding: '12px' }}>
              <h4 style={{ margin: '0 0 8px' }}>{p.name}</h4>
              <p style={{ margin: '0 0 4px' }}><strong>₹{p.price}</strong> / kg</p>
              <p style={{ margin: '0 0 4px' }}>Stock: {p.stock} kg</p>
              <p style={{ margin: '0 0 4px' }}>Grade: {p.grade}</p>
              <p style={{ margin: '0 0 8px' }}>Rating: {p.rating}</p>
              {renderStatus(p)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
