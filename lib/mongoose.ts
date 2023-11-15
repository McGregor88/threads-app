import mongoose from "mongoose";

// Variable to check if mongoose is connected
let isConnected = false;

export const connectToDB = async () => {
    mongoose.set("strictQuery", true);

    if (!process.env.MONGODB_URL) {
        throw new Error('MONGODB_URL not found');
    }

    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected = true;
    } catch (error: any) {
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
}