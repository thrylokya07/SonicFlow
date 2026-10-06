const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes("<db_username>") || uri.includes("<db_password>")) {
    console.log("⚠️ MongoDB credentials are not configured.");
    console.log("ℹ️ Running backend with local audio streaming fallback data.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("ℹ️ Running backend with local audio streaming fallback data.");
    return false;
  }
}

module.exports = connectDB;
