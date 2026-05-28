import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for querySrv ECONNREFUSED issues in some Node.js DNS environments
dns.setDefaultResultOrder('ipv4first');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = './data.json';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishi_connect';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = "AIzaSyA-Tq_tCh_Cp_r-ul5t4_AK10oM70OfWZ8";

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, default: '' },
  village: { type: String, default: 'Tumkur' },
  type: { type: String, default: 'farmer' },
  status: { type: String, default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 100 },
  unit: { type: String, default: 'kg' },
  quality: { type: String, default: 'A+' },
  health: { type: String, default: 'Good' },
  category: { type: String, default: 'Vegetables' },
  status: { type: String, default: 'Unverified' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
  farmerName: { type: String, default: 'Local Farmer' },
  farmerPhone: { type: String, default: 'guest' },
  village: { type: String, default: 'Tumkur' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  productName: { type: String, required: true },
  farmerName: { type: String, required: true },
  companyName: { type: String, default: 'AgriCorp' },
  quantity: { type: Number, default: 100 },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, default: 'Processing' },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  date: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// ==========================================
// AUTOMATIC DATA MIGRATION ROUTINE
// ==========================================
async function migrateDbIfNeeded() {
  try {
    const dataExists = await fs.access(DATA_FILE).then(() => true).catch(() => false);
    if (!dataExists) {
      console.log('ℹ️ No data.json found. Skipping migration.');
      return;
    }

    console.log('📦 Found data.json. Starting migration to MongoDB...');
    const rawData = await fs.readFile(DATA_FILE, 'utf8');
    const db = JSON.parse(rawData);

    // Migrate Users
    if (db.users && Array.isArray(db.users)) {
      let migratedUsers = 0;
      for (const u of db.users) {
        const exists = await User.findOne({ $or: [{ id: u.id }, { phone: u.phone }] });
        if (!exists) {
          await User.create({
            id: u.id,
            name: u.name,
            phone: u.phone,
            password: u.password || '',
            village: u.village,
            type: u.type,
            status: u.status,
            registeredAt: u.registeredAt ? new Date(u.registeredAt) : new Date()
          });
          migratedUsers++;
        }
      }
      console.log(`✅ Migrated ${migratedUsers} new users.`);
    }

    // Migrate Products
    if (db.products && Array.isArray(db.products)) {
      let migratedProducts = 0;
      for (const p of db.products) {
        const exists = await Product.findOne({ id: p.id });
        if (!exists) {
          await Product.create({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            unit: p.unit,
            quality: p.quality,
            health: p.health,
            category: p.category,
            status: p.status,
            image: p.image,
            farmerName: p.farmerName,
            farmerPhone: p.farmerPhone,
            village: p.village,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
          });
          migratedProducts++;
        }
      }
      console.log(`✅ Migrated ${migratedProducts} new products.`);
    }

    // Migrate Orders
    if (db.orders && Array.isArray(db.orders)) {
      let migratedOrders = 0;
      for (const o of db.orders) {
        const exists = await Order.findOne({ id: o.id });
        if (!exists) {
          await Order.create({
            id: o.id,
            productName: o.productName,
            farmerName: o.farmerName,
            companyName: o.companyName,
            quantity: o.quantity,
            totalPrice: o.totalPrice,
            status: o.status,
            paymentMethod: o.paymentMethod,
            date: o.date,
            createdAt: o.createdAt ? new Date(o.createdAt) : new Date()
          });
          migratedOrders++;
        }
      }
      console.log(`✅ Migrated ${migratedOrders} new orders.`);
    }

    // Rename data.json to data.json.bak to mark migration done
    const backupFile = `${DATA_FILE}.bak`;
    await fs.rename(DATA_FILE, backupFile);
    console.log(`🎉 Migration completed successfully! data.json backed up as ${backupFile}`);

  } catch (error) {
    console.error('❌ Data migration failed:', error.message);
  }
}

// Default Data Seeding Routine
async function seedDefaultDataIfNeeded() {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();

    if (userCount === 0) {
      console.log('🌱 Seeding default users...');
      await User.create([
        { id: 1, name: 'Rajesh Kumar', phone: '9876543210', village: 'Tumkur', type: 'farmer', status: 'approved' },
        { id: 2, name: 'Suresh Patil', phone: '9822334455', village: 'Nashik', type: 'farmer', status: 'pending' },
        { id: 3, name: 'AgriCorp Bulk Ltd', phone: '9000112233', village: 'Mumbai', type: 'company', status: 'approved' }
      ]);
      console.log('✅ Default users seeded.');
    }

    if (productCount === 0) {
      console.log('🌱 Seeding default products...');
      await Product.create([
        { id: 101, name: 'Organic Tomato', price: 58, unit: 'kg', stock: 500, quality: 'A+', health: 'Good', farmerName: 'Rajesh Kumar', farmerPhone: '9876543210', village: 'Tumkur', status: 'Approved', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
        { id: 102, name: 'Premium Potato', price: 32, unit: 'kg', stock: 1200, quality: 'A', health: 'Good', farmerName: 'Rajesh Kumar', farmerPhone: '9876543210', village: 'Tumkur', status: 'Approved', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' }
      ]);
      console.log('✅ Default products seeded.');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

// Connect to MongoDB Database
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('🚀 Connected to MongoDB successfully');
    await migrateDbIfNeeded();
    await seedDefaultDataIfNeeded();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Health Check
app.get('/health', async (req, res) => res.json({ status: 'ok', message: 'Krishi Connect REST API Server is Active.' }));

// ==========================================
// AI CROP DETECTION API
// ==========================================
app.post('/api/detect-crop', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image data provided' });

  try {
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];
    console.log("[AI] Analyzing crop image via Gemini...");

    const payload = {
      contents: [{
        parts: [
          { text: "Identify the agricultural product in the uploaded image. Return a JSON object with exactly these fields: \"name\": string (product name), \"quality\": string (e.g., A+, A, B), \"health\": string (e.g., N/A, Good), \"suggested_price\": number (INR per kg). Return ONLY the JSON object, no extra text." },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) return res.status(data.error.code || 500).json({ error: 'AI Error', details: data.error.message });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      throw new Error("Invalid AI response format");
    }
  } catch (error) {
    console.error("[AI] Error:", error.message);
    res.status(500).json({ error: 'Detection failed', details: error.message });
  }
});

// ==========================================
// USER API ENDPOINTS
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  const { name, phone, password, village, type } = req.body;
  
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit phone number required' });
  }

  try {
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const newUser = new User({
      id: Date.now(),
      name,
      phone,
      password: password || '',
      village: village || 'Tumkur',
      type: type || 'farmer',
      status: 'pending',
      registeredAt: new Date()
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { phone, type } = req.body;
  
  try {
    const user = await User.findOne({ phone, type });
    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please register.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.put('/api/users/:id/status', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { status } = req.body;

  try {
    const user = await User.findOneAndUpdate({ id: userId }, { status }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
});

// ==========================================
// PRODUCTS API ENDPOINTS
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

app.get('/api/products/farmer/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const farmerProducts = await Product.find({ farmerPhone: phone }).sort({ createdAt: -1 });
    res.json(farmerProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farmer products', details: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, stock, unit, quality, health, category, image, farmerName, farmerPhone, village } = req.body;

  try {
    const newProduct = new Product({
      id: Date.now(),
      name,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 100,
      unit: unit || 'kg',
      quality: quality || 'A+',
      health: health || 'Good',
      category: category || 'Vegetables',
      status: 'Unverified',
      image: image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
      farmerName: farmerName || 'Local Farmer',
      farmerPhone: farmerPhone || 'guest',
      village: village || 'Tumkur',
      createdAt: new Date()
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

app.put('/api/products/:id/verify', async (req, res) => {
  const productId = parseInt(req.params.id);
  const { status } = req.body;

  try {
    const product = await Product.findOneAndUpdate({ id: productId }, { status }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product verification status', details: error.message });
  }
});
// Update product status (Approve/Reject)
app.patch('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  const { status } = req.body;
  try {
    const product = await Product.findOneAndUpdate({ id: productId }, { status }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product status', details: error.message });
  }
});

// ==========================================
// ORDERS API ENDPOINTS
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { productName, farmerName, companyName, quantity, totalPrice, paymentMethod } = req.body;

  try {
    const newOrder = new Order({
      id: Date.now(),
      productName,
      farmerName,
      companyName: companyName || 'AgriCorp',
      quantity: parseInt(quantity) || 100,
      totalPrice: parseFloat(totalPrice) || 0,
      status: 'Processing',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      date: new Date().toLocaleDateString(),
      createdAt: new Date()
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Serve static assets from the React frontend build folder (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all other GET requests to index.html for React SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Krishi Connect Full REST API Server Running`);
  console.log(`🌐 Active on http://localhost:${PORT}`);
  console.log(`📡 Database: MongoDB Cloud Atlas`);
  console.log(`=========================================`);
});
