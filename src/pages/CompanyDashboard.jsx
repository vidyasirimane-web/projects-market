import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, IndianRupee, Search, MapPin, Star, Package, ChevronRight, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [trackedOrder, setTrackedOrder] = useState(null);

  useEffect(() => {
    // Fetch available products from farmers
    const allProducts = [];
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('products_')) {
        const farmerProducts = JSON.parse(localStorage.getItem(key) || '[]');
        const phone = key.replace('products_', '');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const farmer = users.find(u => u.phone === phone);
        
        farmerProducts.forEach(p => {
          allProducts.push({ 
            ...p, 
            farmerName: farmer?.name || 'Local Farmer', 
            village: farmer?.village || 'Unknown' 
          });
        });
      }
    });
    setAvailableProducts(allProducts);

    // Fetch real orders
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const handleCheckout = (p) => {
    setSelectedProduct(p);
    setShowCheckout(true);
  };

  const confirmOrder = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const order = {
      id: Date.now(),
      productName: selectedProduct.name,
      farmerName: selectedProduct.farmerName,
      quantity: 100, // Default bulk
      totalPrice: selectedProduct.price * 100,
      status: 'Processing',
      paymentMethod: paymentMethod,
      date: new Date().toLocaleDateString()
    };

    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    alert(`Order placed successfully using ${paymentMethod}!`);
    setShowCheckout(false);
    setSelectedProduct(null);
    setPaymentMethod(null);
    setActiveTab('orders');
  };

  const getProductImage = (productName) => {
    const product = availableProducts.find(p => p.name === productName);
    return product?.image || 'https://images.unsplash.com/photo-1592919016350-f0c13cb96994?w=200';
  };

  return (
    <div className="pt-32 pb-20 fade-in min-h-screen bg-background text-secondary relative">
      <div className="container px-6">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2">Company <span className="text-primary">Portal</span></h1>
            <p className="text-text-light font-medium tracking-tight">Direct Farm Procurement Dashboard</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right px-8 py-3 bg-white border border-border rounded-[24px] shadow-sm">
              <p className="text-[10px] font-black uppercase text-text-light tracking-widest mb-1">Active Budget</p>
              <p className="text-2xl font-black text-primary tracking-tighter">₹12,45,000</p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: 'browse', label: 'Browse Crops', icon: Search, count: availableProducts.length },
            { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: orders.length },
            { id: 'history', label: 'History', icon: Clock, count: 0 }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'bg-secondary text-white shadow-2xl shadow-secondary/20 scale-105' : 'bg-white border border-border text-text-light hover:border-primary'
              }`}
            >
              <tab.icon size={18} /> 
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div 
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {availableProducts.map((p) => (
                  <motion.div 
                    key={p.id}
                    whileHover={{ y: -10 }}
                    className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-slate-50 relative">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={40} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-primary shadow-sm uppercase tracking-tighter">
                          {p.village}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="font-black text-secondary text-lg leading-tight mb-1 truncate">{p.name}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-xl font-black text-primary tracking-tighter">₹{p.price}</p>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">/ {p.unit}</span>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Farmer Partner</span>
                          <span className="text-xs font-black text-secondary truncate">{p.farmerName}</span>
                        </div>
                        <button 
                          onClick={() => handleCheckout(p)}
                          className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-tighter rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {availableProducts.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                  <Search size={64} className="mx-auto mb-6 text-slate-200" />
                  <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Inventory Found</p>
                  <p className="text-text-light mt-2">Check back later for fresh farm listings.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-6"
            >
              {orders.length > 0 ? orders.map((order) => (
                <motion.div 
                  key={order.id} 
                  className="bg-white p-6 rounded-[32px] border border-border shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row justify-between items-center gap-8 relative group"
                >
                  <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="w-20 h-20 rounded-[24px] overflow-hidden border border-border shrink-0 bg-slate-50">
                      <img src={getProductImage(order.productName)} alt={order.productName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-black text-secondary">{order.productName}</h4>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg uppercase tracking-widest">#{order.id.toString().slice(-6)}</span>
                      </div>
                      <p className="text-sm font-bold text-text-light">Procured from: <span className="text-secondary">{order.farmerName}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-12 w-full lg:w-auto">
                    <div>
                      <p className="text-[10px] font-black uppercase text-text-light tracking-widest mb-1">Order Qty</p>
                      <p className="text-lg font-black text-secondary">{order.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-text-light tracking-widest mb-1">Price Paid</p>
                      <p className="text-lg font-black text-primary tracking-tighter">₹{order.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-text-light tracking-widest mb-1">Ship Status</p>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                        {order.status || 'Processing'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setTrackedOrder(order)}
                    className="w-full lg:w-auto btn bg-secondary text-white rounded-[20px] px-10 py-4 font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/10 hover:bg-primary transition-all group-hover:-translate-y-1"
                  >
                    <Truck size={18} className="mr-2" /> Track Shipment
                  </button>
                </motion.div>
              )) : (
                <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                  <ShoppingBag size={64} className="mx-auto mb-6 text-slate-200" />
                  <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Active Orders</p>
                  <p className="text-text-light mt-2">Start sourcing crops from the "Browse" tab.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100"
            >
              <Clock size={64} className="mx-auto mb-6 text-slate-200" />
              <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">Procurement History</p>
              <p className="text-text-light mt-2">Your past transactions will be archived here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Dashboard Modal */}
      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-secondary tracking-tighter">Order Placement</h2>
                    <p className="text-text-light font-medium">Finalize your procurement for {selectedProduct.name}</p>
                  </div>
                  <button onClick={() => setShowCheckout(false)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 mb-10 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-secondary">{selectedProduct.name}</h4>
                    <p className="text-sm font-bold text-primary">₹{selectedProduct.price * 100} <span className="text-text-light">/ 100 kg Bulk Order</span></p>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-light opacity-60">Choose Payment Method</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${
                        paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-primary/20 text-slate-400'
                      }`}
                    >
                      <IndianRupee size={32} />
                      <span className="font-black text-[10px] uppercase tracking-widest">Cash on Delivery</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('Online Payment')}
                      className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${
                        paymentMethod === 'Online Payment' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-primary/20 text-slate-400'
                      }`}
                    >
                      <Star size={32} />
                      <span className="font-black text-[10px] uppercase tracking-widest">Pay Online</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={confirmOrder}
                  className="w-full py-5 bg-secondary text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-secondary/20 hover:bg-primary transition-all active:scale-95"
                >
                  Confirm Order Placement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Track Shipment Modal */}
      <AnimatePresence>
        {trackedOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-secondary">Shipment Tracker</h2>
                <button onClick={() => setTrackedOrder(null)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl mb-8">
                <p className="text-[10px] font-black uppercase text-text-light tracking-widest mb-1">Order</p>
                <p className="font-black text-secondary text-lg">{trackedOrder.productName}</p>
                <p className="text-sm text-text-light">From: {trackedOrder.farmerName} &middot; {trackedOrder.date}</p>
              </div>
              <div className="flex flex-col gap-4">
                {['Order Placed', 'Processing', 'In Transit', 'Delivered'].map((step, i) => {
                  const statusOrder = ['Order Placed', 'Processing', 'In Transit', 'Delivered'];
                  const currentIdx = statusOrder.indexOf(trackedOrder.status || 'Processing');
                  const isActive = i <= currentIdx;
                  return (
                    <div key={step} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${ isActive ? 'bg-primary/10 border border-primary/20' : 'bg-slate-50 opacity-40' }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${ isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400' }`}>{i + 1}</div>
                      <span className={`font-bold ${ isActive ? 'text-primary' : 'text-slate-400' }`}>{step}</span>
                      {i === currentIdx && <span className="ml-auto text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Current</span>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setTrackedOrder(null)} className="mt-8 w-full py-4 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyDashboard;
