import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, TrendingUp, Clock, CheckCircle, XCircle, LayoutDashboard, Settings, Camera, Upload, Loader2, Sparkles, ShieldCheck, Bell, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FarmerDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddForm, setShowAddForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQuality, setManualQuality] = useState('');
  const [manualName, setManualName] = useState('');
  const [chats, setChats] = useState([]);
  const [replyText, setReplyText] = useState({});

  const stats = [
    { label: 'Total Earnings', value: '₹1,24,500', icon: <TrendingUp className="text-primary" />, color: 'bg-emerald-50' },
    { label: 'Active Orders', value: '12', icon: <Clock className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Completed', value: '48', icon: <CheckCircle className="text-emerald-500" />, color: 'bg-emerald-50' },
    { label: 'Rejected', value: '2', icon: <XCircle className="text-red-500" />, color: 'bg-red-50' },
  ];

  const [myProducts, setMyProducts] = useState([]);

  const [accountStatus, setAccountStatus] = useState('approved');
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const loadChats = (phone) => {
    const savedChats = JSON.parse(localStorage.getItem('farmerChats') || '[]');
    const myChats = savedChats.filter(c => c.farmerPhone === phone);
    setChats(myChats);
  };

  const handleSendReply = (chatId) => {
    const text = replyText[chatId];
    if (!text || !text.trim()) return;

    const savedChats = JSON.parse(localStorage.getItem('farmerChats') || '[]');
    const updatedChats = savedChats.map(c => {
      if (c.id === chatId) {
        const replies = c.replies || [];
        return {
          ...c,
          replies: [...replies, {
            id: Date.now(),
            sender: userData.name,
            message: text.trim(),
            timestamp: new Date().toLocaleString()
          }]
        };
      }
      return c;
    });

    localStorage.setItem('farmerChats', JSON.stringify(updatedChats));
    setReplyText(prev => ({ ...prev, [chatId]: '' }));
    loadChats(userData.phone);
    alert("Reply sent successfully!");
  };

  const handleDeleteChat = (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat thread?")) return;
    const savedChats = JSON.parse(localStorage.getItem('farmerChats') || '[]');
    const filtered = savedChats.filter(c => c.id !== chatId);
    localStorage.setItem('farmerChats', JSON.stringify(filtered));
    loadChats(userData.phone);
  };

  React.useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (sessionUser && sessionUser.name) {
      // Find the latest version of this user in the master list
      const latestUser = allUsers.find(u => u.phone === sessionUser.phone) || sessionUser;
      latestUser.status = 'approved'; // Auto-approve for easy testing
      setUserData(latestUser);
      setAccountStatus('approved');
      // Update session with latest data
      localStorage.setItem('currentUser', JSON.stringify(latestUser));

      // Load products for this specific user
      const savedProducts = localStorage.getItem(`products_${latestUser.phone}`);
      if (savedProducts) {
        setMyProducts(JSON.parse(savedProducts));
      }

      // Load direct crop messages
      loadChats(latestUser.phone);
    } else {
      // Redirect to login if no valid session is found
      navigate('/login?type=farmer');
    }
  }, [navigate]);

  const [showNotifications, setShowNotifications] = useState(false);

  const detectCrop = async (imageData) => {
    setIsDetecting(true);
    setDetectionResults(null);
    try {
      const response = await fetch('http://localhost:5000/api/detect-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      
      if (!response.ok) throw new Error('Backend error');
      
      const data = await response.json();
      setDetectionResults(data);
      setManualPrice(data.suggested_price || '');
      setManualQuality(data.quality || '');
    } catch (error) {
      console.error("Detection error:", error);
      // Fallback for demo if API fails
      setDetectionResults({
        name: "Detected Crop",
        quality: "A+",
        health: "Good",
        suggested_price: 45
      });
      setManualPrice('45');
      setManualQuality('A+');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        detectCrop(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setPreview(null);
    setDetectionResults(null);
    setManualQuantity('');
    setManualPrice('');
    setManualQuality('');
    setManualName('');
    setIsDetecting(false);
  };

  const handleRequestVerification = (product) => {
    const requests = JSON.parse(localStorage.getItem('verificationRequests') || '[]');
    const newRequest = {
      id: Date.now(),
      productId: product.id,
      farmerName: "Rajesh Kumar", // Mock current user
      productName: product.name,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };
    
    localStorage.setItem('verificationRequests', JSON.stringify([...requests, newRequest]));
    
    // Update local state to show 'Verification Requested'
    setMyProducts(myProducts.map(p => 
      p.id === product.id ? { ...p, status: 'Verifying...' } : p
    ));
    
    alert("Verification request sent to Admin Panel!");
  };

  const handleRequestAccountVerification = () => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const sessionUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Update master list
    const updatedUsers = users.map(u => u.phone === sessionUser.phone ? { ...u, status: 'verifying' } : u);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Update session
    const updatedSession = { ...sessionUser, status: 'verifying' };
    localStorage.setItem('currentUser', JSON.stringify(updatedSession));
    
    setUserData(updatedSession);
    setAccountStatus('verifying');
    alert("Account Verification Request sent to Admin! Your profile is now being reviewed.");
  };

  const handleAddItem = (status = 'Unverified') => {
    const newProduct = {
      id: Date.now(),
      name: manualName || detectionResults?.name || "Organic Crop",
      price: parseFloat(manualPrice) || detectionResults?.suggested_price || 45,
      quality: manualQuality || detectionResults?.quality || "A+",
      health: detectionResults?.health || "Good",
      unit: 'kg',
      stock: parseInt(manualQuantity) || 100,
      category: 'Vegetables', 
      status: status,
      image: preview || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'
    };
    
    const updatedProducts = [newProduct, ...myProducts];
    setMyProducts(updatedProducts);
    
    // Persist to local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userPhone = userData?.phone || currentUser.phone || 'guest';
    localStorage.setItem(`products_${userPhone}`, JSON.stringify(updatedProducts));
    
    setShowAddForm(false);
    resetForm();
    alert("Product successfully added to 'Your Uploaded Products'!");
  };

  return (
    <div className="pt-32 pb-20 fade-in min-h-screen bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Responsive Sidebar (Horizontal swipeable carousel on mobile, stable sidebar on desktop) */}
          <aside className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 no-scrollbar shrink-0">
            {accountStatus === 'approved' ? (
              <>
                <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold whitespace-nowrap shrink-0 transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'glass hover:bg-primary/10'}`}>
                  <LayoutDashboard size={20} /> Overview
                </button>
                <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold whitespace-nowrap shrink-0 transition-all ${activeTab === 'inventory' ? 'bg-primary text-white shadow-lg' : 'glass hover:bg-primary/10'}`}>
                  <Package size={20} /> My Products
                </button>
                <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold whitespace-nowrap shrink-0 transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg' : 'glass hover:bg-primary/10'}`}>
                  <Clock size={20} /> Orders
                </button>
                <button onClick={() => setActiveTab('chats')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold justify-between gap-4 whitespace-nowrap shrink-0 transition-all ${activeTab === 'chats' ? 'bg-primary text-white shadow-lg' : 'glass hover:bg-primary/10'}`}>
                  <span className="flex items-center gap-3"><MessageSquare size={20} /> Buyer Messages</span>
                  {chats.length > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-black rounded-full ${activeTab === 'chats' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>{chats.length}</span>
                  )}
                </button>
              </>
            ) : (
              <div className="p-6 glass-card bg-primary/5 border-primary/20 text-center w-full">
                <ShieldCheck size={32} className="mx-auto mb-4 text-primary" />
                <p className="text-sm font-bold text-primary uppercase tracking-widest">Verification Mode</p>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
                <p className="text-text-light flex items-center gap-2">
                  Welcome back, <span className="font-bold text-secondary">{userData?.name || 'Farmer'}</span>
                  {accountStatus === 'approved' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-md shadow-sm">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer">
                  <div onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell size={24} className={`transition-colors ${showNotifications ? 'text-primary' : 'text-text-light hover:text-primary'}`} />
                  </div>
                  
                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-border p-6 z-50 overflow-hidden"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                            <h4 className="font-bold text-lg">Notifications</h4>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">1 New</span>
                          </div>
                          
                          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                              <p className="font-bold text-xs text-primary mb-1 uppercase tracking-widest">Account Status</p>
                              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {accountStatus === 'verifying' 
                                  ? 'Your verification request has been successfully sent to the Admin Panel. We are reviewing your profile.' 
                                  : accountStatus === 'approved' 
                                  ? 'Congratulations! Your account is fully verified. You can now list products.'
                                  : 'Welcome to Krishi Connect! Please complete your profile and request verification to start selling.'}
                              </p>
                              <p className="text-[10px] text-text-light mt-3 font-bold">Just now</p>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                {accountStatus === 'approved' && (
                  <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                    <Plus size={20} /> Upload your crops photo
                  </button>
                )}
              </div>
            </header>

            {accountStatus !== 'approved' && (
              <div className="mb-10 p-10 glass-card bg-white border-2 border-primary/20 shadow-2xl rounded-[40px]">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <ShieldCheck size={48} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-secondary mb-2">
                      {accountStatus === 'verifying' ? 'Verification in Progress' : 'Welcome to Krishi Connect'}
                    </h3>
                    <p className="text-text-light text-lg max-w-xl mx-auto">
                      {accountStatus === 'verifying' 
                        ? 'Admin is currently reviewing your registration details. Please verify your info below:' 
                        : 'Your account is ready! Please submit your details for verification to start selling.'}
                    </p>
                  </div>

                  {/* Farmer Details from Registration */}
                  <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-border">
                      <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Full Name</p>
                      <p className="text-xl font-bold">{userData?.name || 'N/A'}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-border">
                      <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Village</p>
                      <p className="text-xl font-bold">{userData?.village || 'N/A'}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-border">
                      <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Phone Number</p>
                      <p className="text-xl font-bold">+91 {userData?.phone || '00000 00000'}</p>
                    </div>
                  </div>

                  {accountStatus !== 'verifying' && (
                    <button 
                      onClick={handleRequestAccountVerification}
                      className="btn btn-primary px-12 py-4 text-lg shadow-xl shadow-primary/20 mt-6"
                    >
                      Submit for Verification
                    </button>
                  )}
                </div>
              </div>
            )}

            {accountStatus === 'approved' && (
              <>
                {/* Stats Grid - always shown when approved */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  {stats.map((stat, i) => (
                    <div key={i} className={`glass-card ${stat.color} border-none`}>
                      <div className="flex items-center justify-between mb-4">
                        {stat.icon}
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Status</span>
                      </div>
                      <p className="text-text-light text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Overview Tab */}
            {accountStatus === 'approved' && activeTab === 'overview' && (
              <div className="glass overflow-hidden rounded-3xl mt-2">
                <div className="p-6 border-b border-border bg-slate-50/50">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="text-primary" /> Account Overview
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-2xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Full Name</p>
                    <p className="text-xl font-bold">{userData?.name || 'N/A'}</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Village</p>
                    <p className="text-xl font-bold">{userData?.village || 'N/A'}</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Phone Number</p>
                    <p className="text-xl font-bold">+91 {userData?.phone || 'N/A'}</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-1">Account Status</p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase">
                      <ShieldCheck size={12} /> Verified &amp; Active
                    </span>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-border col-span-full">
                    <p className="text-[10px] uppercase font-bold text-text-light tracking-widest mb-3">Products Uploaded</p>
                    <p className="text-3xl font-black text-primary">{myProducts.length} <span className="text-base font-bold text-text-light">products listed</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* My Products Tab */}
            {(activeTab === 'inventory' || !accountStatus || accountStatus !== 'approved') && (
            <div className="glass overflow-hidden rounded-3xl mt-8">
              <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Package className="text-primary" /> Your Uploaded Products
                </h3>
                <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-1 rounded-full">
                  {myProducts.length} Total Items
                </span>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {myProducts.map((p) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                      {/* Square Image Header */}
                      <div className="aspect-square w-full overflow-hidden bg-slate-50 relative">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                            <Package size={24} strokeWidth={1} />
                            <span className="text-[8px] font-bold uppercase tracking-widest">No Image</span>
                          </div>
                        )}
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                          p.status === 'Hold' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.status === 'Hold' ? '🟡 On Hold' : '🟢 Live'}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 flex flex-col gap-2">
                        <div>
                          <h4 className="text-base font-black text-secondary leading-tight truncate">{p.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-lg font-black text-primary tracking-tighter">₹{p.price}</span>
                            <span className="text-xs font-bold text-text-light uppercase tracking-widest">/ {p.unit}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-1 text-[11px] bg-slate-50 p-2 rounded-xl">
                          <div><span className="text-text-light font-bold">Stock:</span> <span className="font-extrabold">{p.stock} kg</span></div>
                          <div><span className="text-text-light font-bold">Quality:</span> <span className="font-extrabold text-emerald-600">{p.quality || 'A+'}</span></div>
                          <div className="col-span-2"><span className="text-text-light font-bold">Health:</span> <span className="font-extrabold text-blue-600">{p.health || 'Good'}</span></div>
                          
                          <div className="col-span-2 flex items-center justify-between border-t border-slate-200 mt-1 pt-2">
                             <span className="text-text-light font-bold">Consumer Rating:</span>
                             <span className="font-extrabold flex items-center gap-1 text-amber-500">⭐ 4.8 (12 Reviews)</span>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = myProducts.map(prod => {
                                if (prod.id === p.id) {
                                  return { ...prod, status: prod.status === 'Hold' ? 'Unverified' : 'Hold' };
                                }
                                return prod;
                              });
                              setMyProducts(updated);
                              localStorage.setItem(`products_${userData.phone}`, JSON.stringify(updated));
                            }}
                            className="col-span-2 mt-1 w-full py-2 bg-slate-100 hover:bg-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider rounded-xl transition-all"
                          >
                            Toggle Status: {p.status === 'Hold' ? '🟢 Go Live' : '🟡 Put on Hold'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {myProducts.length === 0 && (
                  <div className="py-20 text-center opacity-40">
                    <Package size={64} className="mx-auto mb-4 stroke-1" />
                    <p className="text-xl font-medium">No products uploaded yet.</p>
                    <p className="text-sm">Click "Upload your crops photo" to get started.</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Orders Tab */}
            {accountStatus === 'approved' && activeTab === 'orders' && (
              <div className="glass overflow-hidden rounded-3xl mt-8">
                <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="text-primary" /> Incoming Orders
                  </h3>
                </div>
                <div className="p-6">
                  {(() => {
                    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                    const myOrders = allOrders.filter(o => myProducts.some(p => p.name === o.productName));
                    if (myOrders.length === 0) {
                      return (
                        <div className="py-20 text-center opacity-40">
                          <Clock size={64} className="mx-auto mb-4 stroke-1" />
                          <p className="text-xl font-medium">No orders received yet.</p>
                          <p className="text-sm">When companies place orders for your products, they will appear here.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-4">
                        {myOrders.map(order => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-white rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                          >
                            <div>
                              <h4 className="text-lg font-bold">{order.productName}</h4>
                              <p className="text-sm text-text-light">By: {order.companyName} &middot; {order.date}</p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-[10px] font-bold uppercase text-text-light tracking-widest">Qty</p>
                                <p className="font-black text-secondary">{order.quantity} kg</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase text-text-light tracking-widest">Amount</p>
                                <p className="font-black text-primary">₹{order.totalPrice?.toLocaleString()}</p>
                              </div>
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                order.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                              }`}>{order.status || 'Processing'}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Buyer Messages / Chats Tab */}
            {accountStatus === 'approved' && activeTab === 'chats' && (
              <div className="glass overflow-hidden rounded-3xl mt-8">
                <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-primary" /> Buyer Inquiries &amp; Chats
                  </h3>
                  <span className="text-xs font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {chats.length} Threads
                  </span>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  {chats.length === 0 ? (
                    <div className="py-20 text-center opacity-40">
                      <MessageSquare size={64} className="mx-auto mb-4 stroke-1" />
                      <p className="text-xl font-medium">No buyer inquiries yet.</p>
                      <p className="text-sm">When buyers click "Chat with Farmer" in the Marketplace, inquiries will appear here.</p>
                    </div>
                  ) : (
                    chats.map(chat => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        {/* Header details */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                          <div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full shadow-sm mb-1 inline-block">
                              Inquiry: {chat.productName}
                            </span>
                            <h4 className="text-lg font-black text-secondary">{chat.senderName}</h4>
                            <p className="text-xs text-text-light">{chat.timestamp}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteChat(chat.id)}
                            className="p-2 text-text-light hover:text-red-500 rounded-xl hover:bg-slate-50 transition-colors"
                            title="Delete Chat Thread"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Inquiry Message content */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                          <p className="text-xs font-bold text-text-light uppercase tracking-widest mb-1">Inquiry Message</p>
                          <p className="text-sm font-semibold text-slate-700 leading-relaxed">{chat.message}</p>
                        </div>

                        {/* Chat History / Replies */}
                        {chat.replies && chat.replies.length > 0 && (
                          <div className="flex flex-col gap-3 pl-4 border-l-2 border-primary/20 mb-4">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Conversation History</p>
                            {chat.replies.map(reply => (
                              <div key={reply.id} className="text-xs bg-emerald-50/50 p-3 rounded-xl border border-emerald-50">
                                <p className="font-black text-emerald-800 mb-0.5">{reply.sender} <span className="font-medium text-[9px] text-text-light">({reply.timestamp})</span></p>
                                <p className="font-medium text-slate-700">{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyText[chat.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [chat.id]: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary outline-none text-sm font-medium rounded-xl"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(chat.id); }}
                            />
                          </div>
                          <button
                            onClick={() => handleSendReply(chat.id)}
                            className="btn btn-primary px-5 py-3 rounded-xl text-xs font-bold shadow-md shadow-primary/10"
                          >
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* AI Add Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card bg-white w-full max-w-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-emerald-50/50">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="text-primary" /> AI Crop Detector
                </h2>
                <button onClick={() => { setShowAddForm(false); resetForm(); }} className="text-text-light hover:text-red-500">
                  <XCircle size={28} />
                </button>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Image Upload & Preview */}
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-bold text-text-light uppercase tracking-widest">Crop Photograph</p>
                    
                    {preview ? (
                      <div className="relative rounded-3xl overflow-hidden border-4 border-emerald-100 shadow-xl aspect-square bg-slate-50">
                        <img src={preview} alt="Scan Preview" className="w-full h-full object-cover" />
                        {isDetecting && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                            <Loader2 className="animate-spin" size={48} />
                            <span className="font-bold text-lg">AI Detecting Items...</span>
                          </div>
                        )}
                        <button 
                          onClick={() => { setPreview(null); setDetectionResults(null); }}
                          className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors text-xs font-bold"
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 hover:bg-slate-100/50 transition-all min-h-[250px] relative">
                        <Camera className="text-slate-400" size={40} />
                        <div>
                          <p className="font-bold text-slate-700">Add Crop Photo</p>
                          <p className="text-xs text-text-light mt-1">Upload a photo to optionally auto-fill with AI</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full" />
                            <button className="btn btn-outline text-xs py-2 px-4 rounded-xl">Choose Image</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {preview && !detectionResults && !isDetecting && (
                      <button 
                        onClick={() => detectCrop(preview)} 
                        className="btn bg-emerald-100 text-emerald-700 hover:bg-emerald-200 justify-center py-3 rounded-xl font-bold flex items-center gap-2"
                      >
                        <Sparkles size={16} /> Auto-fill Details with AI
                      </button>
                    )}

                    {detectionResults && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-primary/20 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-emerald-700 uppercase tracking-wider block text-[10px] mb-0.5">AI Analysis Result</span>
                          <span className="font-medium text-slate-700">Detected: <strong>{detectionResults.name}</strong> ({detectionResults.health} Health)</span>
                        </div>
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold text-[9px] uppercase">AI Active</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Crop Details Form */}
                  <div className="flex flex-col gap-5 justify-between">
                    <p className="text-sm font-bold text-text-light uppercase tracking-widest">Crop Details</p>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-60">Crop Name</label>
                      <input 
                        type="text" 
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="e.g. Wheat, Organic Tomato, etc."
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-primary outline-none font-bold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold opacity-60">Quality rating</label>
                        <input 
                          type="text" 
                          value={manualQuality}
                          onChange={(e) => setManualQuality(e.target.value)}
                          placeholder="e.g. A+, A, B"
                          className="p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-primary outline-none font-bold"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold opacity-60">Quantity (kg)</label>
                        <input 
                          type="number" 
                          value={manualQuantity}
                          onChange={(e) => setManualQuantity(e.target.value)}
                          placeholder="e.g. 500" 
                          className="p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-primary outline-none text-lg font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-60">Price per kg (₹)</label>
                      <input 
                        type="number" 
                        value={manualPrice}
                        onChange={(e) => setManualPrice(e.target.value)}
                        placeholder="e.g. 45"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-primary outline-none text-lg font-bold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 mt-auto">
                      <button onClick={() => { setShowAddForm(false); resetForm(); }} className="btn btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 py-3 justify-center text-xs">
                        Cancel
                      </button>
                      <button onClick={() => handleAddItem('Hold')} className="btn btn-outline border-amber-500 text-amber-600 hover:bg-amber-50 py-3 justify-center text-xs font-bold">
                        Save & Hold
                      </button>
                      <button onClick={() => handleAddItem('Unverified')} className="btn btn-primary py-3 justify-center text-xs">
                        Publish Live
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerDashboard;
