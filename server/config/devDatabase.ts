import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | null = null;

export const connectDevDB = async (): Promise<void> => {
  try {
    // Start in-memory MongoDB for development
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Use standard MongoDB port
        dbName: 'codecrack'
      }
    });
    
    const uri = mongod.getUri();
    console.log(`🔧 Development MongoDB started at: ${uri}`);
    
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`📊 MongoDB Connected (Dev): ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📊 MongoDB disconnected');
    });

    // Close connection when app terminates
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
      console.log('📊 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const stopDevDB = async (): Promise<void> => {
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};
