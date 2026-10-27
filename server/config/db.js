const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config();

let isConnected = false;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ngo_platform';
    console.log(`Connecting to MongoDB...`);
    
    // Connect with 10s timeout to allow secure Atlas SSL connection
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    console.log(`MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Notice] MongoDB connection issue (${error.message}).`);
    console.log(`Server will run seamlessly with in-memory persistence mode enabled.`);
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
