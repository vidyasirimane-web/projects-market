import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, User, Phone, MapPin, ShieldCheck, ArrowRight, Building2, Eye, EyeOff, Loader2, Leaf, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || '/api';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = searchParams.get('type') || 'farmer';
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({ name: '', phone: '', password: '', village: '' });

  const isFarmer = userType === 'farmer';

  const features = isFarmer
    ? [
        { icon: <ShieldCheck size={16} />, title: 'Verified Farmer Network', desc: 'Admin-audited profiles for trust' },
        { icon: <ArrowRight size={16} />, title: 'Direct Bulk Sales', desc: 'No middlemen, best prices guaranteed' },
        { icon: <CheckCircle size={16} />, title: 'AI Crop Detection', desc: 'Smart pricing via Gemini AI' },
      ]
    : [
        { icon: <ShieldCheck size={16} />, title: 'Verified Suppliers', desc: 'Quality-checked farmer network' },
        { icon: <ArrowRight size={16} />, title: 'Bulk Procurement', desc: 'Order 100kg+ at wholesale rates' },
        { icon: <CheckCircle size={16} />, title: 'Live Shipment Tracking', desc: 'Real-time order status updates' },
      ];

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.type === userType) {
      navigate(userType === 'farmer' ? '/farmer-dashboard' : '/company-dashboard');
    }
  }, [navigate, userType]);

  const handleQuickLogin = async (phone) => {
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${API}/users/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: userType }),
      });
      const user = await res.json();
      if (!res.ok) throw new Error(user.error || 'Login failed');
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate(userType === 'farmer' ? '/farmer-dashboard' : '/company-dashboard');
    } catch (err) {
      setErrorMsg(err.message);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (formData.phone.length !== 10) { setErrorMsg('Please enter a valid 10-digit phone number.'); return; }
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch(`${API}/users/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, type: userType }),
        });
        const user = await res.json();
        if (!res.ok) throw new Error(user.error || 'Login failed');
        if (user.password && formData.password && formData.password !== user.password) {
          throw new Error('Incorrect password. Please try again.');
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate(userType === 'farmer' ? '/farmer-dashboard' : '/company-dashboard');
      } else {
        const res = await fetch(`${API}/users/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, type: userType }),
        });
        const user = await res.json();
        if (!res.ok) throw new Error(user.error || 'Registration failed');
        localStorage.setItem('currentUser', JSON.stringify(user));
        setSuccessMsg('Registration successful! Redirecting...');
        setTimeout(() => navigate(userType === 'farmer' ? '/farmer-dashboard' : '/company-dashboard'), 1200);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.15)', background: 'white' }}
        className="login-grid"
      >
        {/* Left Panel */}
        <div style={{
          padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px',
          background: isFarmer
            ? 'linear-gradient(160deg, #14532d 0%, #16a34a 60%, #15803d 100%)'
            : 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 60%, #1d4ed8 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative circles */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={20} />
              </div>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>KrishiConnect</span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.03em', marginBottom: '12px' }}>
              {isLogin ? 'Welcome Back! 👋' : 'Join the Network 🌾'}
            </h2>
            <p style={{ opacity: 0.85, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
              {isFarmer ? 'Connect with companies. Sell your produce at the best market price.' : 'Procure high-quality agricultural products directly from verified farmers.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '2px' }}>{f.title}</p>
                    <p style={{ opacity: 0.75, fontSize: '0.78rem' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portal toggle */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', padding: '14px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Switch Portal</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/login?type=farmer" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', background: isFarmer ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '0.8rem', textAlign: 'center', border: isFarmer ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent' }}>
                🌾 Farmer
              </a>
              <a href="/login?type=company" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', background: !isFarmer ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '0.8rem', textAlign: 'center', border: !isFarmer ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent' }}>
                🏢 Company
              </a>
            </div>
          </div>
        </div>

        {/* Right Panel – Form */}
        <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Tab Toggle */}
          <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '14px', padding: '4px', marginBottom: '36px', border: '1px solid #e2e8f0' }}>
            {['Login', 'Register'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit',
                  background: (tab === 'Login') === isLogin ? 'white' : 'transparent',
                  color: (tab === 'Login') === isLogin ? '#16a34a' : '#64748b',
                  boxShadow: (tab === 'Login') === isLogin ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            {isLogin ? `Sign in to ${isFarmer ? 'Farmer' : 'Company'} Portal` : `Create ${isFarmer ? 'Farmer' : 'Company'} Account`}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '28px' }}>
            {isLogin ? 'Enter your credentials to continue' : 'Fill in the details to get started'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence>
              {!isLogin && (
                <motion.div key="register-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" placeholder="Full Name" required style={{ paddingLeft: '44px' }} onChange={e => setFormData({ ...formData, name: e.target.value })} value={formData.name} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" placeholder={isFarmer ? 'Village Name' : 'Company City'} style={{ paddingLeft: '44px' }} onChange={e => setFormData({ ...formData, village: e.target.value })} value={formData.village} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="tel" placeholder="10-digit Phone Number" required maxLength={10} style={{ paddingLeft: '44px' }}
                onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} value={formData.phone} />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" style={{ paddingLeft: '44px', paddingRight: '44px' }}
                onChange={e => setFormData({ ...formData, password: e.target.value })} value={formData.password} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}>
                  ⚠️ {errorMsg}
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#16a34a', fontSize: '0.875rem', fontWeight: '600' }}>
                  ✅ {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', fontWeight: '700', fontSize: '1rem',
              fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(22,163,74,0.3)', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : (isLogin ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>

          {/* Quick Demo */}
          {isLogin && (
            <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1.5px dashed rgba(22,163,74,0.3)', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '12px' }}>
                ⚡ Quick Demo Access
              </p>
              <button type="button"
                onClick={() => handleQuickLogin(isFarmer ? '9876543210' : '9000112233')}
                disabled={loading}
                style={{ width: '100%', padding: '11px 16px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1e293b'; }}
              >
                {isFarmer ? <><User size={16} /> Demo Farmer – Rajesh Kumar</> : <><Building2 size={16} /> Demo Company – AgriCorp Bulk Ltd</>}
              </button>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.875rem' }}>
            {isLogin ? "Don't have an account? " : 'Already registered? '}
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }} style={{ color: '#16a34a', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 700px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-grid > div:first-child { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Login;
