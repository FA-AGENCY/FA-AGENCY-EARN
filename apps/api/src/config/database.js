import mongoose from 'mongoose';

const safeDatabaseError = (error) => String(error?.message || 'Unknown database error')
  .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '[redacted-mongodb-uri]');

export async function connectDatabase(uri) {
  if (!uri) {
    console.warn('MongoDB URI is not configured. Database connection is disabled in this local MVP build.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected.');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', safeDatabaseError(error));
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected.');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', safeDatabaseError(error));
    return false;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  console.log('MongoDB disconnected gracefully.');
}
