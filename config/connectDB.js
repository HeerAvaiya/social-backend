import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = {
            dbName: "insta-backend"
        };
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log("MongoDB Connected Successfully...");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

export default connectDB;
