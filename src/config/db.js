import mongoose from "mongoose";
import "dotenv/config";


const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.DB)
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDb