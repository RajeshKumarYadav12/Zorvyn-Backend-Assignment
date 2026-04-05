import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: `);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // exit app if DB fails
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};