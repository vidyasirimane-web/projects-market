import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanedUser = username.trim().toLowerCase();
    
    if ((cleanedUser === 'admin' || cleanedUser === 'admin@gmail.com') && password === 'admin123') {
      localStorage.setItem('adminUser', JSON.stringify({ type: 'admin' }));
      navigate('/admin');
    } else {
      setErrorMsg('Invalid admin credentials.');
    }
  };

  const handleQuickLogin = () => {
    setUsername('admin@gmail.com');
    setPassword('admin123');
    localStorage.setItem('adminUser', JSON.stringify({ type: 'admin' }));
    navigate('/admin');
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

          <button type="submit" className="btn btn-primary py-4 text-lg mt-4 shadow-xl shadow-primary/20 justify-center">
            Secure Login
          </button>
        </form>

        <div className="demo-accounts-box">
          <h4>Quick Demo Access</h4>
          <button 
            type="button" 
            onClick={handleQuickLogin}
            className="demo-btn"
          >
            <ShieldCheck size={16} /> Login as Demo Admin
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
