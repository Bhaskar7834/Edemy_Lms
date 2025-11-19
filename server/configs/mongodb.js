import mongoose from "mongoose";

// Connect to the MongoDB database
const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log('Database Connected'));

    // FIX: Use the URI exactly as it is in the .env file
    await mongoose.connect(process.env.MONGODB_URI);

}

export default connectDB;