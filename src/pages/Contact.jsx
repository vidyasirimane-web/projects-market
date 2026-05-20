import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMsg = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleString()
    };
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    localStorage.setItem('contactMessages', JSON.stringify([newMsg, ...messages]));

    // Construct deep mailto URL to initiate a native email composer
    const recipient = 'vidyasirimane@gmail.com';
    const emailSubject = encodeURIComponent(`Krishi Connect Inquiry: ${formData.subject}`);
    const emailBody = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Subject: ${formData.subject}\n\n` +
      `Message:\n${formData.message}`
    );
    
    // Redirect to open default system email client
    window.location.href = `mailto:${recipient}?subject=${emailSubject}&body=${emailBody}`;

    alert('Your message has been logged and your default email composer is launching to send the message!');
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  return (
    <div className="pt-32 pb-20 fade-in">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <p className="text-text-light italic">Have questions? We're here to help you connect and grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="flex flex-col gap-8">
            <div className="glass-card flex items-start gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Email Us</h4>
                <p className="text-text-light">vidyasirimane@gmail.com</p>
              </div>
            </div>

            <div className="glass-card flex items-start gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Call Us</h4>
                <p className="text-text-light">+91 91874 83151</p>
                <p className="text-text-light">Mon-Sat, 9am - 6pm</p>
              </div>
            </div>

            <div className="glass-card flex items-start gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Visit Us</h4>
                <p className="text-text-light">Krishi Connect Hub, APMC Yard</p>
                <p className="text-text-light">Tumkur, Karnataka - 572101</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card bg-white p-8">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <MessageSquare className="text-primary" /> Send a Message
            </h3>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold opacity-60">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="p-3 bg-background border border-border rounded-xl outline-none focus:border-primary" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold opacity-60">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="p-3 bg-background border border-border rounded-xl outline-none focus:border-primary" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold opacity-60">Subject</label>
                <select 
                  className="p-3 bg-background border border-border rounded-xl outline-none focus:border-primary"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option>General Inquiry</option>
                  <option>Farmer Support</option>
                  <option>Business Partnership</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold opacity-60">Message</label>
                <textarea 
                  rows="4" 
                  placeholder="How can we help you?" 
                  className="p-3 bg-background border border-border rounded-xl outline-none focus:border-primary" 
                  required 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary py-4 justify-center text-lg">
                Send Message <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
