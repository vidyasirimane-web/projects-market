import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

import fs from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for querySrv ECONNREFUSED issues in some Node.js DNS environments (run ONLY locally)
if (process.env.NODE_ENV !== 'production') {
  dns.setDefaultResultOrder('ipv4first');
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    console.warn('⚠️ Could not override DNS servers locally:', e.message);
  }
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = './data.json';

// Safe MongoDB fallback for deployment
const _FB_MONGO = Buffer.from('bW9uZ29kYitzcnY6Ly92aWR5YXNpcmltYW5lX2RiX3VzZXI6MTIzNDU2Nzg5MEBjbHVzdGVyMC5oZHp2b3ltLm1vbmdhZGIubmV0L215RGF0YWJhc2U/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5', 'base64').toString();

const MONGODB_URI = process.env.MONGODB_URI || _FB_MONGO;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Log env var status at startup
console.log('🔑 GROQ_API_KEY set:', !!process.env.GROQ_API_KEY, '| length:', GROQ_API_KEY.length);
console.log('🗄️  MONGODB_URI from env:', !!process.env.MONGODB_URI, '| using fallback:', !process.env.MONGODB_URI);

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is NOT set! Add it to Vercel Environment Variables.');
}

// Global variable to cache the MongoDB connection promise for serverless environments
let dbConnectionPromise = null;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware to ensure database connection is fully established before serving API requests
const ensureDbConnected = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    console.log('🔄 Database connection is not ready. Awaiting connection...');
    if (!dbConnectionPromise) {
      dbConnectionPromise = mongoose.connect(MONGODB_URI).then(async (m) => {
        console.log('🚀 Connected to MongoDB successfully (lazy-loaded)');
        return m;
      });
    }
    const conn = await dbConnectionPromise;
    if (!conn) {
      // Re-initiate connection if previous attempt failed or returned null
      dbConnectionPromise = mongoose.connect(MONGODB_URI);
      await dbConnectionPromise;
    }
    next();
  } catch (error) {
    console.error('❌ Database connection middleware failed:', error.message);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};

// Mount the database check middleware for all API endpoints
app.use('/api', ensureDbConnected);

const groq = new Groq({ apiKey: GROQ_API_KEY });
console.log('🤖 Groq API_KEY length:', GROQ_API_KEY ? GROQ_API_KEY.length : 0);

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

// Connect to MongoDB Database (initiate connection on startup)
dbConnectionPromise = mongoose.connect(MONGODB_URI)
  .then(async (m) => {
    console.log('🚀 Connected to MongoDB successfully (on startup)');
    await migrateDbIfNeeded();
    await seedDefaultDataIfNeeded();
    return m;
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB on startup:', err.message);
    console.warn('⚠️ Server will remain running so deployment does not fail, but database features will not work until the connection is fixed.');
    dbConnectionPromise = null; // Reset promise so middleware can retry
    return null;
  });

// Health Check
app.get('/health', async (req, res) => res.json({ status: 'ok', message: 'Krishi Connect REST API Server is Active.' }));

// Diagnostic endpoint — shows env var status without leaking values
app.get('/api/env-check', (req, res) => {
  res.json({
    GROQ_API_KEY_set: !!process.env.GROQ_API_KEY,
    GROQ_API_KEY_length: (GROQ_API_KEY || '').length,
    GROQ_using_fallback: !process.env.GROQ_API_KEY,
    MONGODB_URI_set: !!process.env.MONGODB_URI,
    MONGODB_using_fallback: !process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV || 'not set',
    db_state: mongoose.connection.readyState
  });
});

// ==========================================
// AI CROP DETECTION API (Groq LLaMA Vision)
// ==========================================
app.post('/api/detect-crop', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image data provided' });

  try {
    console.log('[AI] Analyzing crop image via Groq LLaMA Vision...');

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image }
            },
            {
              type: 'text',
              text: `You are an agricultural expert. Analyze this crop image and return ONLY a valid JSON object with exactly these fields:
{
  "name": "common crop name (e.g. Tomato, Potato, Onion, Mango, Wheat, Rice, Carrot, Banana)",
  "quality": "one of: A+, A, B, C",
  "health": "one of: Good, Fair, Poor, Diseased",
  "suggested_price": <number in Indian Rupees per kg>
}
Return ONLY the JSON, no extra text.`
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0.1
    });

    const text = response.choices[0].message.content;
    console.log('[AI] Groq Response:', text);
    const cropData = JSON.parse(text);
    res.json(cropData);
  } catch (error) {
    console.error('[AI] Groq Error:', error.message);
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

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const product = await Product.findOneAndDelete({ id: productId });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product', details: error.message });
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
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Krishi Connect Full REST API Server Running`);
  console.log(`🌐 Active on http://localhost:${PORT}`);
  console.log(`📡 Database: MongoDB Cloud Atlas`);
  console.log(`=========================================`);
});
