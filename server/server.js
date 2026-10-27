const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, isDBConnected } = require('./config/db');

// Load environment variables reliably from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Route handlers
const authRoutes = require('./routes/authRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const aidRequestRoutes = require('./routes/aidRequestRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

// API routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/requests', aidRequestRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NGO Matching & Relief Platform API',
    databaseConnected: isDBConnected(),
    mlEngine: 'NLP TF-IDF & Hybrid Heuristic Recommender'
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to the NGO Aid Request & Matching Platform API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      ngos: '/api/ngos',
      requests: '/api/requests',
      ratings: '/api/ratings'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`NGO Platform Server running on port ${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

module.exports = app;
