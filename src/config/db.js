import mongoose from "mongoose";
const DB = "mongodb+srv://ashil123:UrCwPY8Ui6847wGl@cluster0.jjgrk.mongodb.net/jobboard?"


const connectDb = async ()=>{
    try {
        await mongoose.connect(DB)
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDb