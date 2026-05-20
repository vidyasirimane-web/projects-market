import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, TrendingUp, Globe } from 'lucide-react';

const About = () => {
  const values = [
    { title: 'Transparency', desc: 'Secure and open trading between farmers and companies.', icon: <ShieldCheck className="text-primary" /> },
    { title: 'Direct Connection', desc: 'Removing middlemen to ensure fair pricing for everyone.', icon: <Users className="text-primary" /> },
    { title: 'Innovation', desc: 'Using modern tech to transform the agricultural sector.', icon: <TrendingUp className="text-primary" /> },
    { title: 'Reliability', desc: 'Verified network of farmers and businesses.', icon: <Globe className="text-primary" /> },
  ];

  return (
    <div className="pt-32 pb-20 fade-in">
      <div className="container">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            About <span className="text-primary">Krishi Connect</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-light leading-relaxed"
          >
            Krishi Connect is an innovative agricultural marketplace platform designed to create a direct connection between farmers and companies. Our mission is to simplify agricultural trading by providing a secure, transparent, and user-friendly digital platform where farmers can sell their products directly to companies without the involvement of middlemen.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="glass-card p-10 bg-emerald-50 border-primary/20">
            <h2 className="text-3xl font-bold mb-6 text-secondary">Our Vision</h2>
            <p className="text-text leading-relaxed mb-6">
              We aim to support farmers by helping them receive fair prices for their agricultural products while enabling companies to access quality products from verified farmers. The platform includes farmer registration, company registration, admin verification, product management, and bulk order functionalities to ensure smooth and trusted business transactions.
            </p>
            <p className="text-text leading-relaxed">
              Krishi Connect focuses on improving communication, increasing business opportunities, and promoting digital transformation in the agricultural sector. By using modern web technologies, we strive to build an efficient system that benefits both farmers and companies through direct and reliable agricultural trade.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div 
                key={v.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card text-center flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {v.icon}
                </div>
                <h4 className="font-bold">{v.title}</h4>
                <p className="text-sm text-text-light">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <section className="bg-secondary text-white py-16 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">5000+</h3>
              <p className="opacity-70">Farmers Joined</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">200+</h3>
              <p className="opacity-70">Bulk Orders</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">150+</h3>
              <p className="opacity-70">Verified Companies</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">24/7</h3>
              <p className="opacity-70">Support Available</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
