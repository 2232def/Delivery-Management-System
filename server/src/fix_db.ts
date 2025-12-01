import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('users');
    
    // List indexes to confirm
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    const indexName = 'clerkId_1';
    const indexExists = indexes.some(idx => idx.name === indexName);

    if (indexExists) {
      await collection.dropIndex(indexName);
      console.log(`✅ Successfully dropped obsolete index: ${indexName}`);
    } else {
      console.log(`ℹ️ Index ${indexName} not found. It might have already been removed.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
