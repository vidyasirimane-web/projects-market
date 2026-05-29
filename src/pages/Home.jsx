import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, TrendingUp, Users, ShieldCheck, ShoppingBag, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Vegetables', icon: '🥬' },
  { name: 'Fruits', icon: '🍎' },
  { name: 'Cereals', icon: '🌾' },
  { name: 'Pulses', icon: '🫘' },
  { name: 'Spices', icon: '🌶️' },
  { name: 'Others', icon: '📦' },
];

const products = [
  { name: 'Fresh Apples', price: '120', unit: '1kg', farmer: 'Anil Kumar', image: '/fresh_apple.png' },
  { name: 'Potato', price: '32', unit: '1kg', farmer: 'Amit Singh', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400' },
  { name: 'Onion', price: '35', unit: '1kg', farmer: 'Suresh Patil', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=400' },
];

const heroImages = [
  'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600',
];

const Home = () => {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) nextSlide();
    if (touchStart - touchEnd < -50) prevSlide();
    setTouchStart(null);
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] flex items-center justify-center pt-20 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 z-0">
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: 'transform 0.7s ease-in-out',
            }}
          >
            {heroImages.map((src, idx) => (
              <div key={idx} style={{ flexShrink: 0, width: '100%', height: '100%' }}>
                <img
                  src={src}
                  alt={`Hero Background ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute z-20 p-2 rounded-full text-white backdrop-blur-md"
          style={{ left: '32px', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute z-20 p-2 rounded-full text-white backdrop-blur-md"
          style={{ right: '32px', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          <ChevronRight size={32} />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>

        <div className="container relative z-10 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Direct Connection Between <br />
            <span className="text-primary">Farmers &amp; Companies</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-10 opacity-90"
          >
            Fresh Produce. Better Future. Transparent Direct Sourcing.
          </motion.p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/login?type=company`)}
                className="glass-card flex flex-col items-center gap-3 min-w-[120px] hover:border-primary cursor-pointer transition-transform hover:scale-105"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* How it Works */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { title: 'Farmer Registers', icon: <Users size={40} /> },
              { title: 'Admin Verifies', icon: <ShieldCheck size={40} /> },
              { title: 'Farmer Adds Products', icon: <TrendingUp size={40} /> },
              { title: 'Company Places Order', icon: <ShoppingBag size={40} /> },
              { title: 'Delivery & Payment', icon: <CheckCircle2 size={40} /> },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4 relative">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                  {step.icon}
                </div>
                <h4 className="font-semibold">{step.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
