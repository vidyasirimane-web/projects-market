import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, ChevronDown, User, Building2, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
  };

  const isActive = (path) => {
    if (path.includes('type=farmer')) return location.pathname === '/login' && location.search.includes('type=farmer');
    if (path.includes('type=company')) return location.pathname === '/login' && location.search.includes('type=company');
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin-login';
    return location.pathname === path;
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}>
              <Leaf size={18} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', letterSpacing: '-0.03em' }}>Krishi</span>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#16a34a', letterSpacing: '-0.03em' }}>Connect</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="md-nav">
            {[
              { to: '/', label: 'Home' },
              { to: '/marketplace', label: 'Marketplace' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  color: isActive(to) ? '#16a34a' : '#64748b',
                  background: isActive(to) ? 'rgba(22,163,74,0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!isActive(to)) { e.target.style.color = '#16a34a'; e.target.style.background = 'rgba(22,163,74,0.06)'; }}}
                onMouseLeave={e => { if (!isActive(to)) { e.target.style.color = '#64748b'; e.target.style.background = 'transparent'; }}}
              >
                {label}
              </Link>
            ))}


          </div>

          {/* CTA / Auth area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px',
                  background: 'rgba(22,163,74,0.08)', borderRadius: '10px',
                  border: '1px solid rgba(22,163,74,0.2)',
                }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentUser.type === 'company' ? <Building2 size={14} color="white" /> : <User size={14} color="white" />}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#16a34a', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    color: '#ef4444', fontWeight: '600', fontSize: '0.8rem',
                    cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setLoginDropdown(true)}
                  onMouseLeave={() => setLoginDropdown(false)}
                >
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '10px',
                    background: 'white', border: '1.5px solid #e2e8f0',
                    color: '#334155', fontWeight: '600', fontSize: '0.875rem',
                    cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit',
                  }}>
                    Login <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: loginDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                  {loginDropdown && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                      background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: '200px', zIndex: 200,
                    }}>
                      <Link to="/login?type=farmer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', color: '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #f1f5f9', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.06)'; e.currentTarget.style.color = '#16a34a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1e293b'; }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="#16a34a" />
                        </div>
                        <div>
                          <div>Farmer Portal</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '400' }}>Sell your crops</div>
                        </div>
                      </Link>
                      <Link to="/login?type=company" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', color: '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.color = '#3b82f6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1e293b'; }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={16} color="#3b82f6" />
                        </div>
                        <div>
                          <div>Company Portal</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '400' }}>Bulk procurement</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
                <Link to="/login?type=farmer" style={{
                  padding: '9px 18px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: 'white', fontWeight: '700', fontSize: '0.875rem',
                  textDecoration: 'none', boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.3)'; }}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none', padding: '8px', borderRadius: '8px', background: 'transparent',
                border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#334155',
              }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid #e2e8f0', background: 'white',
            padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            {[
              { to: '/', label: 'Home' },
              { to: '/marketplace', label: 'Marketplace' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
              { to: '/login?type=farmer', label: '🌾 Farmer Login' },
              { to: '/login?type=company', label: '🏢 Company Login' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                  fontWeight: '600', fontSize: '0.9rem',
                  color: isActive(to) ? '#16a34a' : '#334155',
                  background: isActive(to) ? 'rgba(22,163,74,0.08)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
            {currentUser && (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                style={{
                  padding: '12px 16px', borderRadius: '10px', background: '#fef2f2',
                  border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer',
                  fontSize: '0.9rem', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <LogOut size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Logout ({currentUser.name})
              </button>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .md-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
