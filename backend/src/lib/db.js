import mongoose from 'mongoose';
import { ENV } from './env.js';


export default async function connectDB(){
    try{
        await mongoose.connect(ENV.DB_URL)
        console.log("Database connected successfully");
    }
    catch(err){
        console.error("Database connection failed",err);
        process.exit(1);
    }
}