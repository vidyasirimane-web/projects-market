import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <footer className="bg-secondary text-white py-12 mt-20 border-t border-white/10">
          <div className="container grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6">KrishiConnect</h3>
              <p className="opacity-70">Empowering farmers and streamlining bulk agricultural trade since 2024.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="flex flex-col gap-3 opacity-70">
                <li><a href="/" className="hover:text-primary">Home</a></li>
                <li><a href="/about" className="hover:text-primary">About Us</a></li>
                <li><a href="/contact" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="flex flex-col gap-3 opacity-70">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact Us</h4>
              <p className="opacity-70 mb-4">Email: vidyasirimane@gmail.com</p>
              <p className="opacity-70">Phone: +91 91874 83151</p>
            </div>
          </div>
          <div className="container mt-12 pt-8 border-t border-white/10 text-center opacity-50 text-sm">
            © 2024 Krishi Connect. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
