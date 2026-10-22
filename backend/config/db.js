import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

        console.log("URI exists:", !!uri);
        console.log("URI starts with:", uri?.substring(0, 20));
        console.log("URI ends with:", uri?.slice(-30));

        const connection = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectDB;