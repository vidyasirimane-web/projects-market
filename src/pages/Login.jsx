import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Building2, ShieldCheck, ArrowRight, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const userType = searchParams.get('type') || 'farmer'; // farmer or company

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    village: '',
    details: '', // Farm details or Business license
    crops: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check for existing session
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.name) {
      if (currentUser.type === userType) {
        navigate(currentUser.type === 'farmer' ? '/farmer-dashboard' : '/company-dashboard');
      } else {
        // User is switching roles (e.g. clicked Company Login while logged in as Farmer)
        localStorage.removeItem('currentUser');
      }
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [navigate, userType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // In a real app, this would be a backend call
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentUser = users.find(u => u.phone === formData.phone && u.type === userType);

    if (formData.phone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }

    if (isLogin) {
      if (!currentUser) {
        setErrorMsg("Account not found. Please register.");
        return;
      } else {
        // Save session
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        navigate(userType === 'farmer' ? '/farmer-dashboard' : '/company-dashboard');
      }
    } else {
      // Check if number already exists (Unique constraint)
      const existingUser = users.find(u => u.phone === formData.phone);
      if (existingUser) {
        setErrorMsg("This phone number is already registered. Please login.");
        return;
      }

      // Registration
      const newUser = {
        ...formData,
        type: userType,
        status: 'approved', // Approved immediately for now for easy testing
        id: Date.now()
      };
      localStorage.setItem('registeredUsers', JSON.stringify([...users, newUser]));
      
      // Save session for new user
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      if (userType === 'farmer') {
        alert("Registration successful! Welcome to your Farmer Dashboard.");
        navigate('/farmer-dashboard');
      } else {
        alert("Registration successful! Welcome to your Company Dashboard.");
        navigate('/company-dashboard');
      }
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container max-w-5xl glass-card overflow-hidden grid grid-cols-1 md:grid-cols-2 p-0 shadow-2xl border-none"
      >
        {/* Side Info */}
        <div className={`p-12 text-white flex flex-col justify-center gap-6 ${userType === 'farmer' ? 'bg-primary' : 'bg-accent'}`}>
          <h2 className="text-4xl font-bold">
            {isLogin ? 'Welcome Back!' : 'Join the Network'}
          </h2>
          <p className="text-lg opacity-90">
            {userType === 'farmer' 
              ? 'Connect with leading companies and sell your produce at the best prices.' 
              : 'Procure high-quality agricultural products directly from verified farmers.'}
          </p>
          
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-3">
              <ShieldCheck /> <span>Verified {userType === 'farmer' ? 'Farmers' : 'Companies'} Only</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowRight /> <span>Transparent Bulk Trading</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-12 bg-white">
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`pb-2 font-bold transition-all ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-text-light'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`pb-2 font-bold transition-all ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-text-light'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-5 overflow-hidden"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                    <input type="text" placeholder="Full Name" className="pl-12" required 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                    <input type="text" placeholder="Village Name" className="pl-12" required 
                      onChange={(e) => setFormData({...formData, village: e.target.value})}
                    />
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
              <input 
                type="tel" 
                placeholder="10-Digit Phone Number" 
                className="pl-12" 
                required 
                maxLength={10}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                value={formData.phone}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
              <input type="password" placeholder="Password" className="pl-12" required 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                value={formData.password}
              />
            </div>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100"
              >
                {errorMsg}
              </motion.div>
            )}

            <button type="submit" className="btn btn-primary w-full justify-center py-4 text-lg mt-4">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-text-light">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? 'Register Now' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
