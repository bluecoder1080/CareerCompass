const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI_PROD 
      : process.env.MONGO_URI || 'mongodb://localhost:27017/careercompass';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('🔄 Retrying database connection in 5 seconds...');
    
    // Retry connection after 5 seconds
    setTimeout(() => {
      connectDB();
    }, 5000);
    
    return null;
  }
};

module.exports = { connectDB };
