import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, ChevronRight, Star, MapPin, Package, Phone, X, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [searchParams] = useSearchParams();
  const [chattingProduct, setChattingProduct] = useState(null);
  const [chatMessage, setChatMessage] = useState('');

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser || currentUser.type !== 'company') {
      alert("Please log in as a Company user to chat with farmers.");
      return;
    }

    if (!chatMessage.trim()) return;

    const newChat = {
      id: Date.now(),
      farmerPhone: chattingProduct.farmerPhone,
      senderName: currentUser.name,
      senderPhone: currentUser.phone,
      productName: chattingProduct.name,
      message: chatMessage.trim(),
      timestamp: new Date().toLocaleString(),
      replies: []
    };

    const allChats = JSON.parse(localStorage.getItem('farmerChats') || '[]');
    localStorage.setItem('farmerChats', JSON.stringify([newChat, ...allChats]));
    
    alert(`Message sent to ${chattingProduct.farmerName} successfully!`);
    setChatMessage('');
    setChattingProduct(null);
  };

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlCategory) setSelectedCategory(urlCategory);

    const allProducts = [];
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('products_')) {
        const farmerProducts = JSON.parse(localStorage.getItem(key) || '[]');
        const phone = key.replace('products_', '');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const farmer = users.find(u => u.phone === phone);
        farmerProducts.forEach(p => {
          if (p.status === 'Approved' || p.status === 'Unverified') {
            allProducts.push({ ...p, farmerName: farmer?.name || 'Local Farmer', village: farmer?.village || 'Unknown', farmerPhone: farmer?.phone || '' });
          }
        });
      }
    });

    if (allProducts.length === 0) {
      setProducts([
        { id: 1, name: 'Organic Tomato', price: 58, unit: 'kg', stock: 500, farmerName: 'Rajesh Kumar', village: 'Sonipat', farmerPhone: '9876543210', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80' },
        { id: 2, name: 'Premium Potato', price: 32, unit: 'kg', stock: 1200, farmerName: 'Amit Singh', village: 'Hissar', farmerPhone: '9122334455', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
        { id: 3, name: 'Red Onion', price: 35, unit: 'kg', stock: 800, farmerName: 'Suresh Patil', village: 'Nashik', farmerPhone: '9822334455', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
      ]);
    } else {
      setProducts(allProducts);
    }
  }, []);

  const handlePlaceOrder = (product) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.type !== 'company') {
      alert("Please login as a Company to place orders.");
      return;
    }
    const order = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      quantity: 100,
      totalPrice: product.price * 100,
      status: 'Pending',
      companyName: currentUser.name,
      farmerName: product.farmerName,
      date: new Date().toLocaleDateString()
    };
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([order, ...orders]));
    alert(`Order placed successfully for ${product.name}! Farmer ${product.farmerName} will be notified.`);
    setSelectedProduct(null);
  };

  const getFilteredSortedProducts = () => {
    let result = products
      .filter(p => selectedCategory === 'All' || p.category === selectedCategory || (!p.category && selectedCategory === 'Vegetables'))
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  };



  return (
    <div className="pt-32 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2">Krishi <span className="text-primary">Marketplace</span></h1>
            <p className="text-text-light font-medium">Direct sourcing from verified farmers.</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} />
              <input 
                type="text" 
                placeholder="Search crops..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl focus:border-primary outline-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`btn glass border-border p-4 rounded-2xl transition-all ${showFilterPanel ? 'bg-primary text-white border-primary' : ''}`}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-6 bg-white rounded-2xl border border-border shadow-lg flex flex-wrap items-center gap-4"
            >
              <span className="text-sm font-bold text-text-light uppercase tracking-widest">Sort By:</span>
              {[['default', 'Default'], ['price-asc', 'Price: Low → High'], ['price-desc', 'Price: High → Low'], ['name', 'Name A-Z']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    sortBy === val ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >{label}</button>
              ))}
              <button onClick={() => { setSortBy('default'); setShowFilterPanel(false); }} className="ml-auto text-text-light hover:text-red-500"><X size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Vegetables', 'Fruits', 'Cereals', 'Pulses'].map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg' : 'bg-white border border-border text-text-light hover:border-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {getFilteredSortedProducts().map((p) => (
            <motion.div 
              key={p.id}
              whileHover={{ y: -10 }}
              className="glass-card p-0 overflow-hidden group cursor-pointer"
              onClick={() => setSelectedProduct(p)}
            >
              <div className="h-64 relative overflow-hidden">
                <img src={p.image || 'https://images.unsplash.com/photo-1592919016350-f0c13cb96994?w=400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow-sm">
                  {p.stock} {p.unit} Available
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star size={14} fill="currentColor" /> 4.8
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-text-light text-sm mb-4">
                  <MapPin size={14} /> {p.village}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div>
                    <p className="text-xs font-bold text-text-light uppercase tracking-widest">Price per {p.unit}</p>
                    <p className="text-2xl font-black text-primary">₹{p.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setChattingProduct(p); }}
                      className="btn bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-4 rounded-2xl border border-emerald-100 transition-all"
                      title="Chat with Farmer"
                    >
                      <MessageSquare size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlaceOrder(p); }}
                      className="btn btn-primary p-4 rounded-2xl shadow-lg shadow-primary/20"
                      title="Place bulk order"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">F</div>
                  <span className="text-xs font-bold text-secondary">{p.farmerName}</span>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 h-80 md:h-auto bg-slate-50 flex items-center justify-center">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain bg-slate-50" />
              </div>
              
              <div className="md:w-1/2 p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-black mb-2">{selectedProduct.name}</h2>
                      <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">Fresh Stock</span>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="text-text-light hover:text-red-500 transition-colors">X</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-1">Farmer</p>
                      <p className="font-bold">{selectedProduct.farmerName}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-1">Location</p>
                      <p className="font-bold">{selectedProduct.village}</p>
                    </div>
                  </div>

                  <p className="text-text-light leading-relaxed mb-6">
                    High quality {selectedProduct.name} grown using sustainable methods. Verified by Krishi Connect quality standards. Ready for bulk shipment.
                  </p>

                  {/* Consumer Reviews */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-3">Consumer Reviews</h4>
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span>AgriCorp Bulk Ltd</span>
                          <span className="text-amber-500">⭐⭐⭐⭐⭐</span>
                        </div>
                        <p className="text-text-light">Excellent quality and very fresh. Sourced 500kg and the packaging was robust.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-black text-primary">₹{selectedProduct.price}</span>
                    <span className="text-text-light font-bold mb-1">/ {selectedProduct.unit}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => handlePlaceOrder(selectedProduct)} className="btn btn-primary flex-1 py-5 text-lg rounded-2xl shadow-xl shadow-primary/20">
                    Place Bulk Order
                  </button>
                  <button
                    onClick={() => {
                      setChattingProduct(selectedProduct);
                    }}
                    className="btn bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-5 rounded-2xl border border-emerald-100 transition-all flex items-center justify-center"
                    title="Chat with Farmer"
                  >
                    <MessageSquare size={24} />
                  </button>
                  <button
                    onClick={() => {
                      const phone = selectedProduct.farmerPhone;
                      if (phone) {
                        navigator.clipboard?.writeText(phone).catch(() => {});
                        alert(`Farmer Contact: +91 ${phone}\n(Number copied to clipboard)`);
                      } else {
                        alert('Contact: support@krishiconnect.com');
                      }
                    }}
                    className="btn glass border-border p-5 rounded-2xl hover:bg-primary/10"
                    title="Contact Farmer"
                  >
                    <Phone size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Dialog Modal */}
      <AnimatePresence>
        {chattingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative border border-border"
            >
              <button 
                onClick={() => { setChattingProduct(null); setChatMessage(''); }}
                className="absolute top-6 right-6 text-text-light hover:text-red-500 font-bold transition-colors"
              >
                X
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Chat with {chattingProduct.farmerName}</h3>
                  <p className="text-xs text-text-light">Inquiring about {chattingProduct.name}</p>
                </div>
              </div>

              <form onSubmit={handleSendChatMessage} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-light uppercase tracking-widest">Your Message</label>
                  <textarea 
                    rows="5"
                    placeholder={`Write your inquiry for ${chattingProduct.farmerName}...`}
                    className="p-4 border border-border rounded-xl focus:border-primary outline-none text-sm leading-relaxed"
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary py-4 justify-center text-sm font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                  Send Inquiry <Send size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
