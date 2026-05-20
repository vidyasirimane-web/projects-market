import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, AlertCircle, CheckCircle, XCircle, Bell, MapPin, Package, Maximize2, Phone, MessageSquare, UserPlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('verifications');
  const [farmerRequests, setFarmerRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilter, setUserFilter] = useState('farmers'); 
  const [allUsers, setAllUsers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminSession')) {
      navigate('/admin-login');
      return;
    }

    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Add dummy data for visual feedback if empty
    if (users.length === 0) {
      users = [
        { id: 1, name: 'Rajesh Kumar', phone: '9876543210', village: 'Sonipat', type: 'farmer', status: 'approved' },
        { id: 2, name: 'Suresh Patil', phone: '9822334455', village: 'Nashik', type: 'farmer', status: 'pending' },
        { id: 6, name: 'Mahesh Babu', phone: '7766554433', village: 'Guntur', type: 'farmer', status: 'verifying' },
        { id: 3, name: 'Amit Singh', phone: '9122334455', village: 'Hissar', type: 'farmer', status: 'approved' },
        { id: 4, name: 'AgriCorp Bulk Ltd', phone: '9000112233', village: 'Mumbai', type: 'company', status: 'approved' },
        { id: 5, name: 'FreshFood Processing', phone: '8877665544', village: 'Pune', type: 'company', status: 'approved' }
      ];
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }
    
    setAllUsers(users);

    // Load all farmer products
    const products = [];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('products_')) {
        const phone = key.replace('products_', '');
        const farmer = users.find(u => u.phone === phone);
        const farmerProducts = JSON.parse(localStorage.getItem(key) || '[]');
        farmerProducts.forEach(p => products.push({ ...p, farmerName: farmer?.name || phone, farmerPhone: phone }));
      }
    });
    setAllProducts(products);

    // Load contact messages
    const msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    setMessages(msgs);

    // Load admin users
    const loadedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    setAdmins(loadedAdmins);
  }, []);

  const getFilteredUsers = () => {
    switch (userFilter) {
      case 'farmers': return allUsers.filter(u => u.type === 'farmer');
      case 'companies': return allUsers.filter(u => u.type === 'company');
      case 'verified': return allUsers.filter(u => u.status === 'approved');
      case 'unverified': return allUsers.filter(u => u.status === 'pending' || u.status === 'verifying');
      default: return allUsers;
    }
  };

  const filteredUsers = getFilteredUsers();

  const handleApproveFarmer = (userId) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updated = users.map(u => u.id === userId ? { ...u, status: 'approved' } : u);
    localStorage.setItem('registeredUsers', JSON.stringify(updated));
    setAllUsers(updated);
    setFarmerRequests(updated.filter(u => u.type === 'farmer'));

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, status: 'approved' }));
    }
    alert("User Approved successfully!");
  };

  const handleRejectFarmer = (userId) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updated = users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u);
    localStorage.setItem('registeredUsers', JSON.stringify(updated));
    setAllUsers(updated);
    setFarmerRequests(updated.filter(u => u.type === 'farmer'));

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, status: 'rejected' }));
    }
    alert("User Rejected.");
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="container">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Admin Control Center</h1>
            <p className="text-text-light">System oversight & Verification Management</p>
          </div>
          <button onClick={() => {
            localStorage.removeItem('adminSession');
            navigate('/admin-login');
          }} className="btn btn-outline border-red-500 text-red-500 hover:bg-red-50">Logout</button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Admin Sidebar (Left) */}
          <aside className="w-full lg:w-64 flex flex-col gap-2">
            <button onClick={() => setActiveTab('verifications')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'verifications' ? 'bg-secondary text-white shadow-lg' : 'bg-white hover:bg-slate-100'}`}>
              <Users size={20} /> User Management
            </button>
            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-secondary text-white shadow-lg' : 'bg-white hover:bg-slate-100'}`}>
              <ShieldCheck size={20} /> Product Verifications
              {allProducts.length > 0 && <span className="ml-auto bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{allProducts.length}</span>}
            </button>
            <button onClick={() => setActiveTab('messages')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'messages' ? 'bg-secondary text-white shadow-lg' : 'bg-white hover:bg-slate-100'}`}>
              <MessageSquare size={20} /> Customer Messages
              {messages.length > 0 && <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{messages.length}</span>}
            </button>
            <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'admins' ? 'bg-secondary text-white shadow-lg' : 'bg-white hover:bg-slate-100'}`}>
              <UserPlus size={20} /> Manage Admins
              {admins.length > 0 && <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{admins.length}</span>}
            </button>
          </aside>

          {/* Main Panel */}
          <main className="flex-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-border bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter">
                  {activeTab === 'verifications' ? `${userFilter} List` : 
                   activeTab === 'products' ? 'Product Verifications' : 
                   activeTab === 'messages' ? 'Customer Messages' : 'Manage Admins'}
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                  {activeTab === 'verifications' ? `${filteredUsers.length} total` : 
                   activeTab === 'products' ? `${allProducts.length} total` : 
                   activeTab === 'messages' ? `${messages.length} total` : `${admins.length} total`}
                </span>
              </div>

              <div className="p-8">
                {activeTab === 'verifications' && (
                <div className="flex flex-col gap-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                      <AlertCircle size={48} />
                      <p className="text-lg font-bold">No users found in this category.</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.div 
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 border border-border rounded-2xl hover:border-primary/20 transition-all bg-white shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.type === 'farmer' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              <Users size={28} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold">{user.name}</h4>
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${user.type === 'farmer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {user.type}
                                </span>
                                {user.status === 'approved' && (
                                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
                                    <ShieldCheck size={12} /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-text-light mt-1 font-medium">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {user.village || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Phone size={12} /> {user.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <button onClick={() => setSelectedUser(user)} className="btn btn-outline text-xs py-2 px-4 rounded-xl">Bio</button>
                            {(user.status === 'pending' || user.status === 'verifying') ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleRejectFarmer(user.id)} className="btn bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 text-xs font-bold rounded-xl">Reject</button>
                                <button onClick={() => handleApproveFarmer(user.id)} className="btn btn-primary py-2 px-6 text-xs font-bold rounded-xl shadow-lg shadow-primary/20">Approve</button>
                              </div>
                            ) : (
                              <div className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest ${user.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {user.status === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {user.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                )}

                {activeTab === 'products' && (
                <div className="flex flex-col gap-4">
                  {allProducts.length === 0 ? (
                    <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                      <Package size={48} />
                      <p className="text-lg font-bold">No products submitted yet.</p>
                    </div>
                  ) : (
                    allProducts.map((product, idx) => (
                      <motion.div
                        key={product.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 border border-border rounded-2xl hover:border-primary/20 transition-all bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold">{product.name}</h4>
                            <p className="text-xs text-text-light">By: {product.farmerName} &middot; ₹{product.price}/{product.unit} &middot; Stock: {product.stock} kg</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                            product.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            product.status === 'Hold' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>{product.status || 'Pending'}</span>
                          <button
                            onClick={() => {
                              const key = `products_${product.farmerPhone}`;
                              const products = JSON.parse(localStorage.getItem(key) || '[]');
                              const updated = products.map(p => p.id === product.id ? { ...p, status: 'Approved' } : p);
                              localStorage.setItem(key, JSON.stringify(updated));
                              setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'Approved' } : p));
                              alert('Product Approved!');
                            }}
                            className="btn btn-primary py-2 px-4 text-xs font-bold rounded-xl"
                          >Approve</button>
                          <button
                            onClick={() => {
                              const key = `products_${product.farmerPhone}`;
                              const products = JSON.parse(localStorage.getItem(key) || '[]');
                              const updated = products.map(p => p.id === product.id ? { ...p, status: 'Rejected' } : p);
                              localStorage.setItem(key, JSON.stringify(updated));
                              setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'Rejected' } : p));
                              alert('Product Rejected.');
                            }}
                            className="btn bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 text-xs font-bold rounded-xl"
                          >Reject</button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                )}

                {activeTab === 'messages' && (
                  <div className="flex flex-col gap-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                        <MessageSquare size={48} />
                        <p className="text-lg font-bold">No customer messages found.</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 border border-border rounded-2xl hover:border-primary/20 transition-all bg-white shadow-sm"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-secondary">{msg.name}</h4>
                                <p className="text-xs text-text-light">{msg.email} &middot; {msg.date}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  const updated = messages.filter(m => m.id !== msg.id);
                                  localStorage.setItem('contactMessages', JSON.stringify(updated));
                                  setMessages(updated);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Message"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Subject: {msg.subject}</p>
                              <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'admins' && (
                  <div className="flex flex-col gap-8">
                    {/* Add Admin Form */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-border">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
                        <UserPlus size={20} className="text-primary" /> Add New Admin User
                      </h4>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAdminError('');
                          setAdminSuccess('');
                          
                          const allowedEmails = [
                            'chandanakm1215@gmail.com',
                            'Sandeepthippeswami02@gmail.com',
                            'kanchanald05@gmail.com',
                            'vidyasirimane@gmail.com'
                          ];

                          const cleanedEmail = adminEmail.trim().toLowerCase();

                          if (!cleanedEmail) {
                            setAdminError('Please enter an email.');
                            return;
                          }

                          if (!allowedEmails.includes(cleanedEmail)) {
                            setAdminError('Access Denied: This email address is not authorized to be an admin.');
                            return;
                          }

                          const existing = admins.find(a => a.email.toLowerCase() === cleanedEmail);
                          if (existing) {
                            setAdminError('This admin email is already registered.');
                            return;
                          }

                          const newAdmin = {
                            id: Date.now(),
                            email: cleanedEmail,
                            password: ''
                          };

                          const updated = [...admins, newAdmin];
                          localStorage.setItem('adminUsers', JSON.stringify(updated));
                          setAdmins(updated);
                          setAdminEmail('');
                          setAdminSuccess('Admin registered successfully! They can set their password upon their first login.');
                        }}
                        className="flex flex-col md:flex-row gap-4 items-end"
                      >
                        <div className="flex-1 flex flex-col gap-2 w-full">
                          <label className="text-xs font-bold text-text-light uppercase tracking-widest">Admin Email</label>
                          <input 
                            type="email" 
                            placeholder="authorized-email@gmail.com" 
                            className="p-3 bg-white border border-border rounded-xl outline-none focus:border-primary w-full"
                            required 
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary py-3 px-8 rounded-xl shadow-lg shadow-primary/20 w-full md:w-auto shrink-0">
                          Register Admin Email
                        </button>
                      </form>

                      {adminError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                          {adminError}
                        </div>
                      )}

                      {adminSuccess && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">
                          {adminSuccess}
                        </div>
                      )}
                    </div>

                    {/* Admin List */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-lg font-bold text-secondary">Active Admin Users</h4>
                      {admins.length === 0 ? (
                        <div className="text-center py-10 opacity-30 text-xs font-bold">
                          No sub-admins registered. Log in with the default admin credentials.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {admins.map((adm) => (
                            <div key={adm.id} className="p-4 bg-white border border-border rounded-xl flex justify-between items-center shadow-sm">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-secondary">{adm.email}</p>
                                  {(!adm.password || adm.password.trim() === '') ? (
                                    <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                                      First-Time Setup Pending
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-light font-bold uppercase tracking-wider">Sub-Admin Profile</p>
                              </div>
                              <button 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove admin access for ${adm.email}?`)) {
                                    const updated = admins.filter(a => a.id !== adm.id);
                                    localStorage.setItem('adminUsers', JSON.stringify(updated));
                                    setAdmins(updated);
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove Admin"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* System Stats / Filter Sidebar (Right) */}
          <aside className="w-full lg:w-72 flex flex-col gap-4">
            <div className="glass-card bg-white p-6 rounded-[32px] shadow-xl border-none">
              <h4 className="text-xs font-black uppercase tracking-widest text-text-light mb-6 opacity-60">Management Filters</h4>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setUserFilter('farmers')}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${userFilter === 'farmers' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100 text-secondary'}`}
                >
                  <div className="flex items-center gap-3"><Users size={18} /> Registered Farmers</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${userFilter === 'farmers' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'}`}>
                    {allUsers.filter(u => u.type === 'farmer').length}
                  </span>
                </button>

                <button 
                  onClick={() => setUserFilter('companies')}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${userFilter === 'companies' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100 text-secondary'}`}
                >
                  <div className="flex items-center gap-3"><Package size={18} /> Registered Companies</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${userFilter === 'companies' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                    {allUsers.filter(u => u.type === 'company').length}
                  </span>
                </button>

                <div className="h-px bg-slate-100 my-2"></div>

                <button 
                  onClick={() => setUserFilter('verified')}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${userFilter === 'verified' ? 'bg-secondary text-white shadow-lg' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                >
                  <div className="flex items-center gap-3"><ShieldCheck size={18} /> Verified Partners</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${userFilter === 'verified' ? 'bg-white/20' : 'bg-emerald-600 text-white'}`}>
                    {allUsers.filter(u => u.status === 'approved').length}
                  </span>
                </button>

                <button 
                  onClick={() => setUserFilter('unverified')}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${userFilter === 'unverified' ? 'bg-amber-600 text-white shadow-lg' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                >
                  <div className="flex items-center gap-3"><AlertCircle size={18} /> Pending Review</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${userFilter === 'unverified' ? 'bg-white/20' : 'bg-amber-200 text-amber-800'}`}>
                    {allUsers.filter(u => u.status === 'pending' || u.status === 'verifying').length}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-secondary rounded-[32px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <h4 className="font-bold text-lg mb-2 relative z-10">Admin Note</h4>
               <p className="text-sm opacity-70 leading-relaxed">Always verify the physical ID documents uploaded by farmers before approving for bulk trade.</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Bio Modal (Enhanced for Farmer Verification) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-bold">Farmer Verification Bio</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-red-500">
                  <XCircle size={28} />
                </button>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                         <Users size={40} />
                       </div>
                       <div>
                         <h4 className="text-2xl font-bold">{selectedUser.name}</h4>
                         <p className="text-primary font-bold">Verified Farmer ID: #{selectedUser.id.toString().slice(-5)}</p>
                       </div>
                    </div>

                    <div className="space-y-4 text-sm">
                       <div>
                         <p className="text-text-light uppercase text-[10px] font-bold tracking-widest">Contact Details</p>
                         <p className="font-bold">{selectedUser.phone}</p>
                         <p className="font-medium text-text-light">{selectedUser.email}</p>
                       </div>
                       <div>
                         <p className="text-text-light uppercase text-[10px] font-bold tracking-widest">Account Status</p>
                         <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                           selectedUser.status === 'approved' ? 'bg-blue-600 text-white' : 
                           selectedUser.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                         }`}>
                           {selectedUser.status}
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                     <p className="text-text-light uppercase text-[10px] font-bold tracking-widest">ID Proof Image Preview</p>
                     <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 overflow-hidden relative group">
                        <Package size={48} />
                        <span className="text-xs font-bold">Government ID Proof</span>
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                           <Maximize2 className="text-primary" />
                        </div>
                     </div>
                     <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mt-4">
                        <p className="text-xs text-blue-700 font-medium">Verify the farm documents and ID proof before approving the account to maintain platform security.</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-border flex justify-end gap-4">
                {selectedUser.status === 'pending' && (
                  <>
                    <button onClick={() => { handleRejectFarmer(selectedUser.id); setSelectedUser(null); }} className="btn bg-red-50 text-red-600 font-bold">Reject Application</button>
                    <button onClick={() => { handleApproveFarmer(selectedUser.id); setSelectedUser(null); }} className="btn btn-primary font-bold">Approve Farmer</button>
                  </>
                )}
                <button onClick={() => setSelectedUser(null)} className="btn btn-outline">Close Bio</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
