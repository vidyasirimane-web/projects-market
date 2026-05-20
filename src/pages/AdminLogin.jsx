import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [setupPendingAdmin, setSetupPendingAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanedUser = username.trim().toLowerCase();
    
    if (cleanedUser === 'admin' && password === 'admin123') {
      localStorage.setItem('adminSession', 'true');
      navigate('/admin');
      return;
    }

    // Check sub-admins in localStorage
    const admins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    
    // First, check if this is an authorized admin with first-time setup pending
    const matchedPending = admins.find(a => a.email.toLowerCase() === cleanedUser && (!a.password || a.password.trim() === ''));
    if (matchedPending) {
      setSetupPendingAdmin(matchedPending);
      return;
    }

    const matchedAdmin = admins.find(a => a.email.toLowerCase() === cleanedUser && a.password === password);

    if (matchedAdmin) {
      localStorage.setItem('adminSession', cleanedUser);
      navigate('/admin');
    } else {
      setErrorMsg('Invalid admin credentials.');
    }
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSetupSuccess('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const admins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const updated = admins.map(a => {
      if (a.email.toLowerCase() === setupPendingAdmin.email.toLowerCase()) {
        return { ...a, password: newPassword };
      }
      return a;
    });

    localStorage.setItem('adminUsers', JSON.stringify(updated));
    setSetupSuccess('Password created successfully! Logging you in...');
    
    setTimeout(() => {
      localStorage.setItem('adminSession', setupPendingAdmin.email.toLowerCase());
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} />
        </div>
        
        {setupPendingAdmin ? (
          <>
            <h2 className="text-3xl font-black mb-2">First-Time Setup</h2>
            <p className="text-text-light font-medium mb-6 text-sm">
              Welcome! Set a secure password for <strong className="text-secondary">{setupPendingAdmin.email}</strong> to activate your admin account.
            </p>

            <form onSubmit={handleSetPassword} className="flex flex-col gap-5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                <input 
                  type="password" 
                  placeholder="New Secure Password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-medium" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary font-medium" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}

              {setupSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                  {setupSuccess}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => { setSetupPendingAdmin(null); setErrorMsg(''); }}
                  className="btn btn-outline flex-1 py-4 text-sm font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-[2] py-4 text-sm font-bold rounded-2xl shadow-xl shadow-primary/20">
                  Create Password
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black mb-2">Admin Portal</h2>
            <p className="text-text-light font-medium mb-8">Login to access system dashboard</p>
     
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                <input 
                  type="text" 
                  placeholder="Admin Username or Email" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary py-4 text-lg mt-4 shadow-xl shadow-primary/20">
                Secure Login
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
