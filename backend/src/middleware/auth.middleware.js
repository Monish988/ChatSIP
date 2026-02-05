
import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";
export const protectRoute = async(req,res,next)=>{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        const decoded = jwt.verify(token,ENV.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized"});
        }
        const user = await User.findById(decoded.userID).select('-password');
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }

        req.user = user;
        next();
    }
    catch(err){
        console.error("Error in protectRoute Middleware:", err);
        return res.status(500).json({message:"Internal Server Error"});
    }
}