import mongoose from "mongoose";
// import "@/utils/models/Branches";
// import "@/utils/models/MenuCategory";
// import "@/utils/models/MenuItem";
// import "@/utils/models/Zone";
// import "@/utils/models/Membership";
// import "@/utils/models/Notification"
// import "@/utils/models/OrderItem"
// import "@/utils/models/Table"
// import "@/utils/models/User"
// import "@/utils/models/WaiterRequest"
// import "@/utils/models/otpVerificatoin"

// In Next.js, we must use the global object to cache the connection.
// This prevents connections from growing exponentially during API Route hot-reloading.
const globalWithMongoose = global as typeof globalThis & {
  mongooseCache: { conn: any; promise: any } | undefined;
};

let cached = globalWithMongoose.mongooseCache;

if (!cached) {
  cached = globalWithMongoose.mongooseCache = { conn: null, promise: null };
}

export const connectToDB = async () => {
  // If we already have a connection, return it immediately
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  const MONGO_URL = process.env.MONGO_URL;

  if (!MONGO_URL) {
    throw new Error("Please define the MONGO_URL environment variable");
  }

  try {
    // If a connection is not already in progress, start one
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGO_URL).then((mongooseInstance) => {
        return mongooseInstance;
      });
    }
    
    // Await the connection and save it to our global cache
    cached.conn = await cached.promise;
    console.log("New database connection established");
    
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset the promise if it fails so we can try again
    console.error("MongoDB Connection Error:", error);
    throw new Error(String(error));
  }
};